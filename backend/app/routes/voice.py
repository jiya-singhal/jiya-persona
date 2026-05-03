"""Vapi tool-call webhook.

If you configure tools natively in Vapi (rather than relying on Gemini function
calling via /v1/chat/completions), Vapi posts here with a tool-calls payload:

  {
    "message": {
      "type": "tool-calls",
      "toolCallList": [
        {"id": "...", "function": {"name": "...", "arguments": "{...}"}},
        ...
      ]
    }
  }

We resolve each call and return:

  {"results": [{"toolCallId": "...", "result": "..."}, ...]}

Reference: https://docs.vapi.ai/tools/custom-tools
"""

import json
import logging
from typing import Any

from fastapi import APIRouter, Request

from app.calendar_integration.calcom import CalcomError, book_meeting, get_availability
from app.config import settings
from app.rag.retriever import query

logger = logging.getLogger(__name__)
router = APIRouter()


async def _resolve_tool(name: str, args: dict[str, Any]) -> Any:
    try:
        if name == "query_knowledge":
            chunks = query(
                voyage_api_key=settings.voyage_api_key,
                chroma_dir=str(settings.chroma_dir),
                query_text=args["query"],
                source_filter=args.get("source_filter", "any"),
                k=10,
                top_k_after_mmr=3,
            )
            return {
                "results": [
                    {"text": c["text"][:400], "source": c["metadata"]} for c in chunks
                ]
            }
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


@router.post("/vapi/tool")
async def vapi_tool(req: Request):
    body = await req.json()
    msg = body.get("message", {}) or body
    tool_calls = msg.get("toolCallList") or msg.get("toolCalls") or []

    results = []
    for tc in tool_calls:
        tc_id = tc.get("id") or tc.get("toolCallId") or ""
        fn = tc.get("function") or {}
        name = fn.get("name", "")
        raw_args = fn.get("arguments", "{}")
        try:
            args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
        except json.JSONDecodeError:
            args = {}
        logger.info(f"vapi tool call: {name}({args})")
        result = await _resolve_tool(name, args)
        results.append({
            "toolCallId": tc_id,
            "result": result if isinstance(result, str) else json.dumps(result),
        })

    return {"results": results}
