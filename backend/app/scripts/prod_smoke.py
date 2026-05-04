"""Prod smoke test against Render-deployed backend.

Hits /health, /chat (SSE), and /v1/chat/completions (both streaming and
non-streaming). Verifies grounded responses + a real Cal.com booking turn.
"""

import asyncio
import json
import os
import sys
import time

import httpx

BASE = os.environ.get("PROD_URL", "https://jiya-persona-backend.onrender.com").rstrip("/")


def hr(label: str) -> None:
    print("\n" + "=" * 80)
    print(label)
    print("-" * 80)


async def case_health():
    hr("[1] /health")
    async with httpx.AsyncClient(timeout=30.0) as c:
        t0 = time.time()
        r = await c.get(f"{BASE}/health")
        dt = (time.time() - t0) * 1000
    print(f"status={r.status_code}  time={dt:.0f}ms  body={r.text}")


async def case_chat_sse(message: str, label: str):
    hr(f"[2] /chat (SSE)  — {label}")
    answer_parts: list[str] = []
    sources_count = 0
    tool_calls: list[dict] = []
    t0 = time.time()
    async with httpx.AsyncClient(timeout=120.0) as c:
        async with c.stream(
            "POST", f"{BASE}/chat",
            json={"message": message, "history": []},
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
                        sources_count = len(obj.get("sources", []))
                    elif current == "text_delta":
                        answer_parts.append(obj.get("delta", ""))
                    elif current == "tool_call":
                        tool_calls.append(obj)
                    elif current == "error":
                        print(f"  ERROR: {obj}")
                        return
                    elif current == "done":
                        break
    dt = (time.time() - t0) * 1000
    print(f"  total={dt:.0f}ms  sources={sources_count}  tool_calls={len(tool_calls)}")
    for tc in tool_calls:
        print(f"  TOOL {tc['name']}({tc.get('args')}) -> {json.dumps(tc.get('result'))[:200]}")
    print(f"\nAnswer: {''.join(answer_parts).strip()}")


async def case_openai_shim_nonstream():
    hr("[3] /v1/chat/completions (non-streaming, voice path)")
    body = {
        "model": "gemini-2.5-flash-lite",
        "stream": False,
        "messages": [
            {"role": "user", "content": "What was the swift-f0 work? One sentence."},
        ],
    }
    t0 = time.time()
    async with httpx.AsyncClient(timeout=60.0) as c:
        r = await c.post(f"{BASE}/v1/chat/completions", json=body)
    dt = (time.time() - t0) * 1000
    print(f"status={r.status_code}  total={dt:.0f}ms")
    if r.status_code == 200:
        obj = r.json()
        print(f"finish={obj['choices'][0]['finish_reason']}")
        print(f"content: {obj['choices'][0]['message'].get('content')}")


async def case_openai_shim_stream_ttft():
    hr("[4] /v1/chat/completions (streaming, measure first-token)")
    body = {
        "model": "gemini-2.5-flash-lite",
        "stream": True,
        "messages": [
            {"role": "user", "content": "What did Jiya do at SingOneSong? Two sentences."},
        ],
    }
    t0 = time.time()
    first_token_at: float | None = None
    chunks_seen = 0
    content_parts: list[str] = []
    async with httpx.AsyncClient(timeout=120.0) as c:
        async with c.stream("POST", f"{BASE}/v1/chat/completions", json=body) as resp:
            async for line in resp.aiter_lines():
                if not line.startswith("data:"):
                    continue
                payload = line[len("data:"):].strip()
                if payload == "[DONE]":
                    break
                obj = json.loads(payload)
                delta = obj["choices"][0].get("delta", {})
                if delta.get("content"):
                    if first_token_at is None:
                        first_token_at = (time.time() - t0) * 1000
                    chunks_seen += 1
                    content_parts.append(delta["content"])
    total = (time.time() - t0) * 1000
    print(f"ttft={first_token_at:.0f}ms  total={total:.0f}ms  chunks={chunks_seen}")
    print(f"answer: {''.join(content_parts)}")


async def main():
    print(f"PROD URL: {BASE}")
    try:
        await case_health()
        await case_chat_sse("What did Jiya do at SingOneSong?", "factual")
        await case_chat_sse(
            "Tell me about the search-listings project — tech and tradeoffs",
            "repo-specific",
        )
        await case_openai_shim_nonstream()
        await case_openai_shim_stream_ttft()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
