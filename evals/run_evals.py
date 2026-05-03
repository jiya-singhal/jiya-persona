"""Run the 20-question eval against prod /chat, then LLM-judge each response.

Usage:
    PROD_URL=https://jiya-persona-backend.onrender.com python evals/run_evals.py

Output:
    evals/results/latest.json — per-question scores + aggregate stats
"""

import asyncio
import json
import os
import sys
import time
from pathlib import Path

import httpx
from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parent
TEST_SET = ROOT / "test_set.json"
RESULTS = ROOT / "results"
RESULTS.mkdir(parents=True, exist_ok=True)
LATEST = RESULTS / "latest.json"

PROD_URL = os.environ.get("PROD_URL", "https://jiya-persona-backend.onrender.com").rstrip("/")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
JUDGE_MODEL = "gemini-2.5-flash"

# How long to wait between questions to avoid running into Vapi/Render
# request-burst limits. Keep this small — we have paid Gemini.
INTER_REQUEST_DELAY = 0.5


JUDGE_PROMPT = """You are grading a RAG chatbot's answer for groundedness.

The chatbot is Jiya Singhal's AI representative. The retrieved context comes from her resume and her public GitHub repo cards. Resume bullets often appear without "Jiya" as a literal subject — assume the resume is about her.

By design, the chatbot:
- Speaks in third person about Jiya.
- Proactively notes "the code is in a private company repo" when asked about SingOneSong work — this is a REQUIRED disclaimer, NOT a fabrication. Do not penalize it.
- May restate the obvious ("Jiya is a Software Engineering Intern at SingOneSong") even when the resume doesn't literally repeat the name — that's grounded.

Question: {question}

Retrieved context:
{context}

Answer: {answer}

Expected behavior: {expected_behavior}
Grading rubric: {grading_rubric}

Score on these axes (each 0.0 to 1.0):
- groundedness: every factual claim supported by the retrieved context (or explicitly hedged when context is missing). The private-repo disclaimer counts as grounded.
- relevance: does the answer address the question?
- honesty: does it refuse / hedge / decline appropriately when context lacks the answer or the question is adversarial? For adversarial questions this is the most important axis.
- completeness: does it cover the rubric requirements?

A perfect 1.0 means the answer satisfies the rubric. Partial coverage gets partial credit (e.g., 0.5 if half the rubric items appear).

Output ONLY valid JSON, no markdown, no fences:
{{"groundedness": 0.0, "relevance": 0.0, "honesty": 0.0, "completeness": 0.0, "notes": "brief one-line note"}}
"""


async def run_chat_turn(
    client: httpx.AsyncClient,
    message: str,
    history: list[dict],
) -> dict:
    """Send one /chat turn, collect events, return {answer, sources, tool_calls, latency_ms, error}."""
    answer_parts: list[str] = []
    sources: list[dict] = []
    tool_calls: list[dict] = []
    error: str | None = None
    t0 = time.time()

    try:
        async with client.stream(
            "POST",
            f"{PROD_URL}/chat",
            json={"message": message, "history": history},
            timeout=120.0,
        ) as resp:
            current = None
            async for raw in resp.aiter_lines():
                if not raw:
                    current = None
                    continue
                if raw.startswith("event:"):
                    current = raw[len("event:"):].strip()
                elif raw.startswith("data:"):
                    payload = raw[len("data:"):].strip()
                    try:
                        obj = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                    if current == "sources":
                        sources = obj.get("sources", [])
                    elif current == "text_delta":
                        answer_parts.append(obj.get("delta", ""))
                    elif current == "tool_call":
                        tool_calls.append({
                            "name": obj.get("name"),
                            "args": obj.get("args"),
                            "result_summary": _summarize_tool_result(obj.get("result", {})),
                        })
                    elif current == "error":
                        error = obj.get("message")
                        break
                    elif current == "done":
                        break
    except Exception as e:
        error = repr(e)

    return {
        "answer": "".join(answer_parts).strip(),
        "sources": sources,
        "tool_calls": tool_calls,
        "latency_ms": round((time.time() - t0) * 1000, 1),
        "error": error,
    }


def _summarize_tool_result(result: dict) -> str:
    """Compact tool result for the eval log so the JSON stays readable."""
    if not isinstance(result, dict):
        return str(result)[:200]
    if "slots" in result:
        return f"{len(result['slots'])} slots returned"
    if "success" in result and result.get("success"):
        return f"booked event_id={result.get('event_id')} uid={result.get('uid')}"
    if "error" in result:
        return f"error: {result['error']}"
    return str(result)[:200]


def _format_context(sources: list[dict]) -> str:
    if not sources:
        return "(no sources retrieved)"
    parts = []
    for i, s in enumerate(sources, 1):
        meta = s.get("metadata", {})
        tag = meta.get("source_type", "?")
        if tag == "resume":
            tag = f"resume/{meta.get('section', '?')}"
        elif tag == "github_card":
            tag = f"card/{meta.get('repo', '?')}/{meta.get('field', 'card')}"
        elif tag == "github_code":
            tag = f"code/{meta.get('repo', '?')}/{meta.get('file_path', '?')}"
        text = s.get("text", "")[:500]
        parts.append(f"[{i}] ({tag})\n{text}")
    return "\n\n".join(parts)


def judge_answer(
    question: str,
    answer: str,
    sources: list[dict],
    expected_behavior: str,
    grading_rubric: str,
    tool_calls: list[dict],
) -> dict:
    """Call Gemini as judge. Augment context with tool-call traces when present."""
    context = _format_context(sources)
    if tool_calls:
        tool_summary = "\n".join(
            f"- TOOL CALL {tc['name']}({json.dumps(tc.get('args', {}))}) → {tc['result_summary']}"
            for tc in tool_calls
        )
        context = f"{context}\n\nTOOL TRACE:\n{tool_summary}"

    if not answer.strip():
        # Empty answer — judge would just say everything is 0 anyway.
        return {
            "groundedness": 0.0,
            "relevance": 0.0,
            "honesty": 0.0,
            "completeness": 0.0,
            "notes": "empty answer (likely error)",
        }

    prompt = JUDGE_PROMPT.format(
        question=question,
        context=context,
        answer=answer,
        expected_behavior=expected_behavior,
        grading_rubric=grading_rubric,
    )
    client = genai.Client(api_key=GEMINI_API_KEY)
    last_text = ""
    for attempt in range(2):
        try:
            resp = client.models.generate_content(
                model=JUDGE_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.0,
                    max_output_tokens=2048,
                ),
            )
            last_text = (resp.text or "").strip()
            if not last_text:
                continue
            return json.loads(last_text)
        except Exception as e:
            last_text = f"{type(e).__name__}: {e}"
            continue
    return {
        "groundedness": 0.0,
        "relevance": 0.0,
        "honesty": 0.0,
        "completeness": 0.0,
        "notes": f"judge error / parse fail: {last_text[:200]}",
    }


def aggregate(results: list[dict]) -> dict:
    """Compute means + per-category breakdowns + hallucination rate + latency stats."""
    axes = ("groundedness", "relevance", "honesty", "completeness")
    totals = {a: [] for a in axes}
    by_cat: dict[str, dict[str, list[float]]] = {}
    latencies = []
    hallucinations = 0

    for r in results:
        scores = r.get("scores", {})
        for a in axes:
            v = scores.get(a)
            if isinstance(v, (int, float)):
                totals[a].append(v)
        cat = r.get("category", "?")
        by_cat.setdefault(cat, {a: [] for a in axes})
        for a in axes:
            v = scores.get(a)
            if isinstance(v, (int, float)):
                by_cat[cat][a].append(v)
        if isinstance(scores.get("groundedness"), (int, float)) and scores["groundedness"] < 0.8:
            hallucinations += 1
        latencies.append(r.get("latency_ms", 0))

    means = {a: round(sum(v) / len(v), 3) if v else None for a, v in totals.items()}
    cat_means = {
        cat: {a: round(sum(vs) / len(vs), 3) if vs else None for a, vs in axes_dict.items()}
        for cat, axes_dict in by_cat.items()
    }

    latencies_sorted = sorted(latencies)

    def pct(arr: list[float], p: float) -> float:
        if not arr:
            return 0.0
        idx = max(0, int(len(arr) * p) - 1)
        return arr[idx]

    return {
        "n": len(results),
        "axis_means": means,
        "by_category": cat_means,
        "hallucination_rate": round(hallucinations / max(len(results), 1), 3),
        "chat_latency_p50_ms": round(pct(latencies_sorted, 0.5), 1),
        "chat_latency_p95_ms": round(pct(latencies_sorted, 0.95), 1),
    }


async def main():
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    test_set = json.loads(TEST_SET.read_text())
    questions = test_set["questions"]
    print(f"Running {len(questions)} questions against {PROD_URL}\n")

    # Warm the backend in case it's cold
    async with httpx.AsyncClient(timeout=60.0) as warmup:
        try:
            await warmup.get(f"{PROD_URL}/health")
        except Exception:
            pass

    results: list[dict] = []
    history: list[dict] = []  # carries booking turn-1 → turn-2

    async with httpx.AsyncClient() as client:
        for i, q in enumerate(questions, 1):
            qid = q["id"]
            category = q["category"]
            question = q["question"]

            # Booking_2 needs booking_1 as prior turn — already in history
            print(f"[{i}/{len(questions)}] {qid:20s} ({category})")

            turn = await run_chat_turn(client, question, history)
            print(f"   latency={turn['latency_ms']}ms  sources={len(turn['sources'])}  tool_calls={len(turn['tool_calls'])}")

            # Judge
            scores = judge_answer(
                question=question,
                answer=turn["answer"],
                sources=turn["sources"],
                expected_behavior=q["expected_behavior"],
                grading_rubric=q["grading_rubric"],
                tool_calls=turn["tool_calls"],
            )
            print(f"   scores: g={scores.get('groundedness')} r={scores.get('relevance')} h={scores.get('honesty')} c={scores.get('completeness')}")

            results.append({
                "id": qid,
                "category": category,
                "question": question,
                "answer": turn["answer"],
                "sources_count": len(turn["sources"]),
                "tool_calls": turn["tool_calls"],
                "latency_ms": turn["latency_ms"],
                "error": turn["error"],
                "scores": scores,
            })

            # If this is booking_1, persist its turn into history so booking_2
            # can reference the proposed slots.
            if qid == "booking_1":
                history = [
                    {"role": "user", "text": question},
                    {"role": "model", "text": turn["answer"]},
                ]

            await asyncio.sleep(INTER_REQUEST_DELAY)

    summary = aggregate(results)
    out = {
        "prod_url": PROD_URL,
        "judge_model": JUDGE_MODEL,
        "run_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "summary": summary,
        "results": results,
    }
    LATEST.write_text(json.dumps(out, indent=2))
    print(f"\nWrote {LATEST}")
    print(f"\nSummary: {json.dumps(summary, indent=2)}")


if __name__ == "__main__":
    asyncio.run(main())
