"""Chat handler — pre-retrieval RAG + Gemini streaming + booking tool-calls.

Architecture:
  - RAG retrieval happens BEFORE the LLM call (no round-trip via query_knowledge tool)
  - Top-6 chunks injected into the user turn as context
  - Booking tools (get_availability, book_meeting) ARE exposed for Gemini to call,
    using google-genai's function-calling. We resolve them server-side, send results
    back to the model, and stream the final response.
  - Conversation history is supported (frontend passes prior turns).
"""

import json
import logging
from collections.abc import AsyncIterator
from dataclasses import dataclass, field

from google import genai
from google.genai import types

from app.agent.system_prompt import SYSTEM_PROMPT, build_user_turn
from app.agent.tools import GET_AVAILABILITY, BOOK_MEETING
from app.calendar_integration.calcom import (
    CalcomError,
    book_meeting,
    get_availability,
)
from app.config import settings
from app.rag.retriever import query
from app.telemetry.latency_log import TurnTimer

logger = logging.getLogger(__name__)

MODEL = "gemini-2.5-flash"
MAX_TOOL_TURNS = 4  # safety cap on tool-call loop


@dataclass
class HistoryTurn:
    role: str  # "user" | "model"
    text: str


@dataclass
class ChatRequest:
    message: str
    source_filter: str = "any"
    history: list[HistoryTurn] = field(default_factory=list)


def _detect_filter(message: str) -> str:
    lower = message.lower()
    repo_signals = ("project", "repo", "github", "built", "code", "tech stack", "tradeoff")
    resume_signals = ("intern", "experience", "singonesong", "tradeindia", "education", "scaler")
    if any(s in lower for s in repo_signals) and not any(s in lower for s in resume_signals):
        return "github"
    if any(s in lower for s in resume_signals) and not any(s in lower for s in repo_signals):
        return "resume"
    return "any"


def _retrieve(message: str, source_filter: str) -> list[dict]:
    return query(
        voyage_api_key=settings.voyage_api_key,
        chroma_dir=str(settings.chroma_dir),
        query_text=message,
        source_filter=source_filter,
        k=12,
        top_k_after_mmr=6,
    )


def _serialize_sources(chunks: list[dict]) -> list[dict]:
    return [
        {
            "text": c["text"][:600],
            "metadata": c["metadata"],
            "score": round(c.get("score", 0.0), 3),
        }
        for c in chunks
    ]


async def _resolve_tool(name: str, args: dict) -> dict:
    """Execute a tool call and return a JSON-serializable result."""
    try:
        if name == "get_availability":
            slots = await get_availability(
                start_date=args["start_date"],
                end_date=args["end_date"],
                timezone=args.get("timezone", "Asia/Kolkata"),
            )
            return {"slots": slots}
        if name == "book_meeting":
            return await book_meeting(
                slot_start=args["slot_start"],
                attendee_name=args["attendee_name"],
                attendee_email=args["attendee_email"],
                notes=args.get("notes", ""),
            )
        return {"error": f"unknown tool {name}"}
    except CalcomError as e:
        return {"error": str(e)}
    except KeyError as e:
        return {"error": f"missing argument: {e}"}


def _to_history_contents(history: list[HistoryTurn]) -> list[types.Content]:
    return [
        types.Content(role=h.role, parts=[types.Part.from_text(text=h.text)])
        for h in history
    ]


async def stream_chat(req: ChatRequest) -> AsyncIterator[dict]:
    """Yield SSE events: sources → text_delta(s) → tool_call(s) → done | error."""
    timer = TurnTimer(channel="chat", message=req.message)
    if not settings.gemini_api_key:
        timer.fail("GEMINI_API_KEY not set")
        timer.finish()
        yield {"event": "error", "data": {"message": "GEMINI_API_KEY not set"}}
        return

    source_filter = req.source_filter or _detect_filter(req.message)
    chunks = _retrieve(req.message, source_filter)
    timer.mark_retrieval_end(len(chunks))
    yield {"event": "sources", "data": {"sources": _serialize_sources(chunks)}}

    user_turn = build_user_turn(req.message, chunks)

    contents: list[types.Content] = _to_history_contents(req.history)
    contents.append(
        types.Content(role="user", parts=[types.Part.from_text(text=user_turn)])
    )

    client = genai.Client(api_key=settings.gemini_api_key)
    booking_tools = types.Tool(function_declarations=[GET_AVAILABILITY, BOOK_MEETING])
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.3,
        max_output_tokens=600,
        tools=[booking_tools],
    )

    for turn in range(MAX_TOOL_TURNS):
        try:
            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=contents,
                config=config,
            )
        except Exception as e:
            logger.exception("Gemini error")
            timer.fail(str(e))
            timer.finish()
            yield {"event": "error", "data": {"message": str(e)}}
            return

        candidate = response.candidates[0] if response.candidates else None
        if not candidate or not candidate.content or not candidate.content.parts:
            timer.fail("empty response")
            timer.finish()
            yield {"event": "error", "data": {"message": "empty response"}}
            return

        function_calls = [p.function_call for p in candidate.content.parts if p.function_call]

        if not function_calls:
            text = response.text or ""
            if text:
                timer.mark_first_token()
                yield {"event": "text_delta", "data": {"delta": text}}
            timer.finish()
            yield {"event": "done", "data": {}}
            return

        contents.append(candidate.content)

        tool_response_parts: list[types.Part] = []
        for fc in function_calls:
            args = dict(fc.args) if fc.args else {}
            logger.info(f"tool call: {fc.name}({args})")
            timer.increment_tool_call()
            result = await _resolve_tool(fc.name, args)
            yield {
                "event": "tool_call",
                "data": {"name": fc.name, "args": args, "result": result},
            }
            tool_response_parts.append(
                types.Part.from_function_response(name=fc.name, response=result)
            )

        contents.append(types.Content(role="user", parts=tool_response_parts))

    timer.fail("tool-call loop limit exceeded")
    timer.finish()
    yield {"event": "error", "data": {"message": "tool-call loop limit exceeded"}}
