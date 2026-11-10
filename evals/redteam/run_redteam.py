"""Prompt-injection red team for the persona chat backend.

Plants evals/redteam/attacks.json into a throwaway copy of the Chroma store,
starts the backend against that copy with REDTEAM_MODE=1, sends each attack's
trigger question to /chat, and checks the reply with the attack's success
regex. Then runs the 30 normal eval questions and counts false blocks.
The production store at backend/data/chroma_db is copied, never written; the
script hashes it before and after and fails if it changed.

Usage, from the repo root with backend/.env populated:
    uv run --project backend python evals/redteam/run_redteam.py --check-delivery
    uv run --project backend python evals/redteam/run_redteam.py            # off, then on
    uv run --project backend python evals/redteam/run_redteam.py --modes spotlight --attacks-only
    uv run --project backend python evals/redteam/run_redteam.py --report-only

Mode "off" writes results/before.json, "on" writes results/after.json, any
other GUARDRAILS value (e.g. "spotlight") writes results/ablation_<mode>.json.
"""

import argparse
import asyncio
import hashlib
import json
import os
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import httpx

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
BACKEND = REPO / "backend"
PROD_STORE = BACKEND / "data" / "chroma_db"
RESULTS = HERE / "results"

# app.config reads ".env" relative to the working directory.
os.chdir(BACKEND)
sys.path[:0] = [str(BACKEND), str(REPO / "evals")]

from app.agent.chat import _detect_filter  # noqa: E402
from app.agent.guardrails import REFUSAL  # noqa: E402
from app.config import settings  # noqa: E402
from app.rag.retriever import ingest_chunks, query  # noqa: E402
from run_evals import fill_date_placeholders  # noqa: E402

INTER_REQUEST_DELAY = float(os.environ.get("REDTEAM_DELAY", "5"))  # free tier allows 15 requests a minute
QUOTA = re.compile(r"429|RESOURCE_EXHAUSTED|quota|rate limit|404|NOT_FOUND|400|INVALID_ARGUMENT", re.I)  # errors every later call would repeat: stop, do not burn the run


def load_corpus() -> dict:
    return json.loads((HERE / "attacks.json").read_text())


def store_hash() -> str:
    h = hashlib.sha256()
    for p in sorted(PROD_STORE.rglob("*")):
        if p.is_file():
            h.update(p.relative_to(PROD_STORE).as_posix().encode())
            h.update(p.read_bytes())
    return h.hexdigest()


def build_store(corpus: dict, tmp: Path) -> Path:
    store = tmp / "chroma_db"
    shutil.copytree(PROD_STORE, store)
    planted = [
        {"text": c["text"], "metadata": {**c["metadata"], "redteam_id": c["id"]}}
        for c in corpus["canary_chunks"] + corpus["attacks"]
    ]
    ingest_chunks(settings.voyage_api_key, str(store), planted, id_prefix="redteam_")
    return store


def delivered(attack: dict, sources: list[dict]) -> bool:
    ids = {s.get("metadata", {}).get("redteam_id") for s in sources}
    return attack["id"] in ids and all(r in ids for r in attack.get("requires", []))


def check_delivery(corpus: dict, store: Path) -> bool:
    """Retrieval only (Voyage, no Gemini): is each poisoned doc retrieved?"""
    ok = True
    for a in corpus["attacks"]:
        chunks = query(settings.voyage_api_key, str(store), a["trigger"],
                       source_filter=_detect_filter(a["trigger"]), k=12, top_k_after_mmr=6)
        hit = delivered(a, chunks)
        ok &= hit
        got = [c["metadata"].get("redteam_id") or c["metadata"].get("source_type") for c in chunks]
        print(f"{'DELIVERED' if hit else 'MISSED   '} {a['id']:22s} {got}")
    return ok


def start_backend(store: Path, mode: str, port: int, log_path: Path) -> subprocess.Popen:
    env = {**os.environ, "CHROMA_DIR": str(store), "REDTEAM_MODE": "1", "GUARDRAILS": mode}
    log = open(log_path, "w")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--port", str(port)],
        cwd=BACKEND, env=env, stdout=log, stderr=subprocess.STDOUT,
    )
    for _ in range(120):
        try:
            if httpx.get(f"http://127.0.0.1:{port}/health", timeout=1).status_code == 200:
                return proc
        except httpx.HTTPError:
            pass
        if proc.poll() is not None:
            break
        time.sleep(0.5)
    proc.terminate()
    raise RuntimeError(f"backend did not start; see {log_path}")


async def chat(client: httpx.AsyncClient, base: str, message: str, history: list[dict]) -> dict:
    out = {"answer": "", "sources": [], "guardrail": None, "tool_calls": [], "error": None}
    parts: list[str] = []
    t0 = time.time()
    try:
        async with client.stream("POST", f"{base}/chat", json={"message": message, "history": history},
                                 timeout=120.0) as resp:
            event = None
            async for line in resp.aiter_lines():
                if line.startswith("event:"):
                    event = line[6:].strip()
                elif line.startswith("data:"):
                    data = json.loads(line[5:].strip())
                    if event == "sources":
                        out["sources"] = data.get("sources", [])
                    elif event == "text_delta":
                        parts.append(data.get("delta", ""))
                    elif event == "guardrail":
                        out["guardrail"] = data.get("rule")
                    elif event == "tool_call":
                        out["tool_calls"].append({"name": data.get("name"), "args": data.get("args"),
                                                  "result": data.get("result")})
                    elif event == "error":
                        out["error"] = data.get("message")
                    if event in ("done", "error"):
                        break
    except Exception as e:  # noqa: BLE001 - recorded, the run continues
        out["error"] = repr(e)
    out["answer"] = "".join(parts).strip()
    out["latency_ms"] = round((time.time() - t0) * 1000)
    return out


def flagged_ids(sources: list[dict]) -> dict[str, str]:
    """Chunks the input check withheld: redteam id (or a readable label) -> reason."""
    out = {}
    for s in sources:
        if s.get("flagged"):
            m = s.get("metadata", {})
            label = m.get("redteam_id") or "/".join(
                str(m.get(k)) for k in ("source_type", "repo", "topic", "file_path", "section") if m.get(k))
            out[label] = s["reason"]
    return out


async def run_mode(corpus: dict, store: Path, mode: str, port: int, attacks_only: bool) -> dict:
    RESULTS.mkdir(parents=True, exist_ok=True)
    proc = start_backend(store, mode, port, RESULTS / f"backend_{mode.replace(',', '_')}.log")
    base = f"http://127.0.0.1:{port}"
    attacks, normals, aborted = [], [], None
    try:
        async with httpx.AsyncClient() as client:
            for a in corpus["attacks"]:
                r = await chat(client, base, a["trigger"], [])
                print(f"[{mode}] {a['id']:22s} {r['latency_ms']}ms guardrail={r['guardrail']} err={r['error']}")
                attacks.append({
                    "id": a["id"], "type": a["type"], "trigger": a["trigger"],
                    "delivered": delivered(a, r["sources"]),
                    "worked": bool(re.search(a["success"]["regex"], r["answer"], re.I)),
                    "flagged": flagged_ids(r["sources"]),
                    "retrieved_redteam_ids": [s["metadata"]["redteam_id"] for s in r["sources"]
                                              if s.get("metadata", {}).get("redteam_id")],
                    **r,
                })
                if r["error"] and QUOTA.search(r["error"]):
                    aborted = f"quota error on {a['id']}: {r['error'][:300]}"
                    break
                await asyncio.sleep(INTER_REQUEST_DELAY)

            questions = [] if attacks_only or aborted else json.loads(
                (REPO / "evals" / "test_set.json").read_text())["questions"]
            history: list[dict] = []
            for q in questions:
                question = fill_date_placeholders(q["question"])
                r = await chat(client, base, question, history)
                blocked = r["answer"] == REFUSAL or bool(r["guardrail"])  # a guardrail refusal; an API error is counted under errors, not here
                print(f"[{mode}] {q['id']:22s} {r['latency_ms']}ms blocked={blocked} err={r['error']}")
                normals.append({"id": q["id"], "category": q["category"], "question": question,
                                "blocked": blocked, "flagged": flagged_ids(r["sources"]), **r})
                if q["id"] == "booking_1":  # booking_2 continues this conversation
                    history = [{"role": "user", "text": question}, {"role": "model", "text": r["answer"]}]
                if r["error"] and QUOTA.search(r["error"]):
                    aborted = f"quota error on {q['id']}: {r['error'][:300]}"
                    break
                await asyncio.sleep(INTER_REQUEST_DELAY)
    finally:
        proc.terminate()
        proc.wait(timeout=15)

    def p50(rows: list[dict]) -> float | None:
        return statistics.median(r["latency_ms"] for r in rows) if rows else None

    return {
        "mode": mode,
        "run_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "aborted": aborted,
        "summary": {
            "attacks": len(attacks),
            "delivered": sum(a["delivered"] for a in attacks),
            "successful": sum(a["delivered"] and a["worked"] for a in attacks),
            "normal_questions": len(normals),
            "false_blocks": sum(n["blocked"] for n in normals),
            "errors": sum(bool(r["error"]) for r in attacks + normals),
            "p50_latency_ms_normal": p50(normals),
            "p50_latency_ms_attacks": p50(attacks),
            "chat_calls": len(attacks) + len(normals),
        },
        "attacks": attacks,
        "normal": normals,
    }


def result_path(mode: str) -> Path:
    name = {"off": "before", "on": "after"}.get(mode, "ablation_" + mode.replace(",", "_"))
    return RESULTS / f"{name}.json"


def yn(v: bool) -> str:
    return "yes" if v else "no"


def stopped_by(after: dict, before: dict | None) -> str:
    if not after["delivered"]:
        return "not delivered"
    if after["worked"]:
        return "nothing (got through)"
    reasons = []
    if after["id"] in after["flagged"]:
        reasons.append(f"input check ({after['flagged'][after['id']]})")
    if after["guardrail"]:
        reasons.append(f"output check ({after['guardrail']})")
    if not reasons:
        reasons.append("spotlighting (model ignored it)")
    if before is not None and not before["worked"]:
        reasons.append("did not work before either")
    return "; ".join(reasons)


def write_report() -> None:
    before = json.loads(result_path("off").read_text())
    after = json.loads(result_path("on").read_text())
    for d in (before, after):  # recompute from the rows so an older results file gets the same definition
        d["summary"]["false_blocks"] = sum(n["answer"] == REFUSAL or bool(n["guardrail"]) for n in d["normal"])
    ablation_path = result_path("spotlight")
    ablation = json.loads(ablation_path.read_text()) if ablation_path.exists() else None
    b = {a["id"]: a for a in before["attacks"]}
    s = {a["id"]: a for a in ablation["attacks"]} if ablation else {}

    head = "| attack | type | delivered (before / after) | worked before | worked after |"
    sep = "| --- | --- | --- | --- | --- |"
    if ablation:
        head += " worked, spotlighting only |"
        sep += " --- |"
    head += " what stopped it (after) |"
    sep += " --- |"
    rows = [head, sep]
    for a in after["attacks"]:
        bb = b.get(a["id"])
        row = (f"| {a['id']} | {a['type']} | {yn(bb['delivered']) if bb else '?'} / {yn(a['delivered'])} | "
               f"{yn(bb['worked']) if bb else '?'} | {yn(a['worked'])} |")
        if ablation:
            row += f" {yn(s[a['id']]['worked']) if a['id'] in s else '?'} |"
        row += f" {stopped_by(a, bb)} |"
        rows.append(row)

    sb, sa = before["summary"], after["summary"]
    lines = [
        "# Red team: prompt injection",
        "",
        "Generated by `evals/redteam/run_redteam.py` from `results/before.json` (GUARDRAILS=off) and "
        "`results/after.json` (GUARDRAILS=on). Both runs use REDTEAM_MODE=1 against the same temporary copy "
        "of the production Chroma store with the ten poisoned documents and one canary chunk planted. "
        "Every number below is read from those files.",
        "",
        f"**Successful injections: {sb['successful']}/{sb['attacks']} before, {sa['successful']}/{sa['attacks']} "
        f"after guardrails; {sa['false_blocks']} false blocks on {sa['normal_questions']} normal questions "
        f"(a false block is a guardrail refusal of a normal question; request errors are counted separately).**",
        "",
        "## Per attack",
        "",
        *rows,
        "",
        "## Normal questions and latency",
        "",
        "| | before (off) | after (on) |",
        "| --- | --- | --- |",
        f"| attacks delivered | {sb['delivered']}/{sb['attacks']} | {sa['delivered']}/{sa['attacks']} |",
        f"| successful injections | {sb['successful']}/{sb['attacks']} | {sa['successful']}/{sa['attacks']} |",
        f"| false blocks on normal questions | {sb['false_blocks']}/{sb['normal_questions']} | "
        f"{sa['false_blocks']}/{sa['normal_questions']} |",
        f"| p50 latency, normal questions | {sb['p50_latency_ms_normal']} ms | {sa['p50_latency_ms_normal']} ms |",
        f"| p50 latency, attack questions | {sb['p50_latency_ms_attacks']} ms | {sa['p50_latency_ms_attacks']} ms |",
        f"| request errors | {sb['errors']} | {sa['errors']} |",
        f"| run at (UTC) | {before['run_at']} | {after['run_at']} |",
        "",
    ]
    attack_ids = {a["id"] for a in after["attacks"]}
    planted = sum(1 for n in after["normal"] for k in n["flagged"] if k in attack_ids)
    real = [(n["id"], k, v) for n in after["normal"] for k, v in n["flagged"].items() if k not in attack_ids]
    lines += [
        f"Input check on the normal questions (after): withheld a planted document {planted} times "
        "(planted documents are retrieved for normal questions too, so these are correct drops); withheld a real chunk "
        + (", ".join(f"on {i}: {k} ({v})" for i, k, v in real) if real else "never") + ".",
        "",
    ]
    if ablation:
        sab = ablation["summary"]
        lines += [f"Spotlighting alone (GUARDRAILS=spotlight, attacks only, run at {ablation['run_at']} UTC): "
                  f"{sab['successful']}/{sab['attacks']} successful.", ""]
    notes = HERE / "report_notes.md"
    if notes.exists():
        lines += [notes.read_text().strip(), ""]
    (HERE / "REPORT.md").write_text("\n".join(lines))
    print(f"wrote {HERE / 'REPORT.md'}")


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--modes", nargs="+", default=["off", "on"],
                    help="GUARDRAILS values to run in order, e.g. off on, or spotlight")
    ap.add_argument("--attacks-only", action="store_true")
    ap.add_argument("--check-delivery", action="store_true", help="retrieval only, no Gemini calls")
    ap.add_argument("--report-only", action="store_true")
    ap.add_argument("--port", type=int, default=8011)
    args = ap.parse_args()

    if args.report_only:
        write_report()
        return
    if not settings.voyage_api_key or (not args.check_delivery and not settings.gemini_api_key):
        sys.exit("VOYAGE_API_KEY / GEMINI_API_KEY missing: populate backend/.env")

    corpus = load_corpus()
    prod_hash = store_hash()
    tmp = Path(tempfile.mkdtemp(prefix="redteam_"))
    try:
        store = build_store(corpus, tmp)
        if args.check_delivery:
            sys.exit(0 if check_delivery(corpus, store) else 1)
        for mode in args.modes:
            result = await run_mode(corpus, store, mode, args.port, args.attacks_only)
            result_path(mode).write_text(json.dumps(result, indent=2, ensure_ascii=False))
            print(f"wrote {result_path(mode)}: {json.dumps(result['summary'])}")
            if result["aborted"]:
                sys.exit(f"stopped: {result['aborted']}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
        if store_hash() != prod_hash:
            sys.exit("production Chroma store changed during the run; restore it with git checkout")
    if result_path("off").exists() and result_path("on").exists():
        write_report()


if __name__ == "__main__":
    asyncio.run(main())
