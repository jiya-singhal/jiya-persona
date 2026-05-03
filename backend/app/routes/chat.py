"""POST /chat — SSE streaming endpoint."""

import json
import logging

from fastapi import APIRouter
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.agent.chat import ChatRequest, HistoryTurn, stream_chat

logger = logging.getLogger(__name__)

router = APIRouter()


class HistoryItem(BaseModel):
    role: str  # "user" | "model"
    text: str


class ChatBody(BaseModel):
    message: str
    source_filter: str | None = None
    history: list[HistoryItem] = []


@router.post("/chat")
async def chat(body: ChatBody):
    req = ChatRequest(
        message=body.message,
        source_filter=body.source_filter or "any",
        history=[HistoryTurn(role=h.role, text=h.text) for h in body.history],
    )

    async def event_gen():
        async for evt in stream_chat(req):
            yield {
                "event": evt["event"],
                "data": json.dumps(evt["data"]),
            }

    return EventSourceResponse(event_gen())
