"""Phase 3 acceptance — multi-turn booking conversation against /chat.

Flow:
  Turn 1: "Can I talk to Jiya next week?"  → expect get_availability tool call
  Turn 2: confirm a slot + provide name + email → expect book_meeting tool call

Prints retrieved sources, tool calls, and the final agent response. The booking
is REAL — it lands on Jiya's Cal.com calendar.
"""

import asyncio
import json
from datetime import date, timedelta

import httpx


URL = "http://127.0.0.1:8000/chat"


async def turn(message: str, history: list[dict]) -> tuple[str, list[dict]]:
    """Send one turn, print events, return assistant text + updated history."""
    print("\n" + "=" * 80)
    print(f"USER: {message}")
    print("-" * 80)

    answer_parts: list[str] = []
    tool_events: list[dict] = []
    src_count = 0

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST", URL, json={"message": message, "history": history}
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
                        src_count = len(obj.get("sources", []))
                    elif current == "text_delta":
                        answer_parts.append(obj.get("delta", ""))
                    elif current == "tool_call":
                        tool_events.append(obj)
                        print(f"  TOOL CALL: {obj['name']}({json.dumps(obj['args'])})")
                        result_preview = json.dumps(obj["result"])[:300]
                        print(f"  TOOL RESULT: {result_preview}")
                    elif current == "error":
                        print(f"  ERROR: {obj}")
                        return "", history
                    elif current == "done":
                        break

    answer = "".join(answer_parts).strip()
    print(f"  Sources: {src_count}, tool calls: {len(tool_events)}")
    print(f"\nAGENT: {answer}")

    new_history = history + [
        {"role": "user", "text": message},
        {"role": "model", "text": answer},
    ]
    return answer, new_history


async def main():
    today = date.today()
    next_week = today + timedelta(days=7)
    next_week_end = today + timedelta(days=10)

    print(f"Today: {today}, requesting window: {next_week} → {next_week_end}")

    history: list[dict] = []

    # Turn 1: ask about availability
    _, history = await turn(
        f"Can I talk to Jiya next week? Looking at any time between "
        f"{next_week.isoformat()} and {next_week_end.isoformat()}.",
        history,
    )

    # Turn 2: confirm first slot + provide attendee details
    # We don't know which slot the model proposed without parsing — let it
    # pick one in the next turn.
    _, history = await turn(
        "The earliest slot on the first day works. My name is Test Bot and "
        "my email is claude-test-agent@example.com. Please book it.",
        history,
    )


if __name__ == "__main__":
    asyncio.run(main())
