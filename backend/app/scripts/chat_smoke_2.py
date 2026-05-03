"""Re-run only the two cases that hit the quota wall."""

import asyncio
from app.scripts.chat_smoke import run_one


CASES = [
    ("booking_intent", "Can I talk to Jiya next week?"),
    ("off_topic", "What's your opinion on the latest iPhone?"),
]


async def main():
    for label, msg in CASES:
        await run_one(label, msg)


if __name__ == "__main__":
    asyncio.run(main())
