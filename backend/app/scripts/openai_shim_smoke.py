"""Phase 5 acceptance — hit /v1/chat/completions like Vapi would.

Three checks:
  1. Non-streaming factual question → grounded answer
  2. Non-streaming booking question → server-side tool loop fetches slots
  3. Streaming version of (1) → confirms SSE chunk format Vapi expects
"""

import asyncio
import json
import sys

import httpx

URL = "http://127.0.0.1:8000/v1/chat/completions"


def hr(label: str) -> None:
    print("\n" + "=" * 80)
    print(label)
    print("-" * 80)


async def case_non_stream_factual():
    hr("[1] non-streaming factual")
    body = {
        "model": "gemini-2.5-flash",
        "stream": False,
        "messages": [
            {"role": "system", "content": "Speak briefly."},
            {"role": "user", "content": "What did Jiya do at SingOneSong? Two sentences."},
        ],
    }
    async with httpx.AsyncClient(timeout=60.0) as c:
        resp = await c.post(URL, json=body)
    print(f"status: {resp.status_code}")
    obj = resp.json()
    msg = obj["choices"][0]["message"]
    print(f"finish_reason: {obj['choices'][0]['finish_reason']}")
    print(f"content: {msg.get('content')}")
    if msg.get("tool_calls"):
        print(f"tool_calls: {json.dumps(msg['tool_calls'], indent=2)}")


async def case_non_stream_booking():
    hr("[2] non-streaming booking — should fetch slots via server-side tool loop")
    body = {
        "model": "gemini-2.5-flash",
        "stream": False,
        "messages": [
            {"role": "user", "content": "Can I book a chat with Jiya between 2026-05-12 and 2026-05-14?"},
        ],
    }
    async with httpx.AsyncClient(timeout=120.0) as c:
        resp = await c.post(URL, json=body)
    print(f"status: {resp.status_code}")
    obj = resp.json()
    msg = obj["choices"][0]["message"]
    print(f"finish_reason: {obj['choices'][0]['finish_reason']}")
    print(f"content: {msg.get('content')}")


async def case_stream_factual():
    hr("[3] streaming factual — confirm OpenAI SSE chunk format")
    body = {
        "model": "gemini-2.5-flash",
        "stream": True,
        "messages": [
            {"role": "user", "content": "What is the search-listings project? One sentence."},
        ],
    }
    async with httpx.AsyncClient(timeout=60.0) as c:
        async with c.stream("POST", URL, json=body) as resp:
            print(f"status: {resp.status_code}")
            async for line in resp.aiter_lines():
                if line.startswith("data:"):
                    payload = line[len("data:"):].strip()
                    if payload == "[DONE]":
                        print("DATA: [DONE]")
                        break
                    obj = json.loads(payload)
                    delta = obj["choices"][0].get("delta", {})
                    finish = obj["choices"][0].get("finish_reason")
                    print(f"DATA delta={delta} finish={finish}")


async def main():
    try:
        await case_non_stream_factual()
        await case_non_stream_booking()
        await case_stream_factual()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
