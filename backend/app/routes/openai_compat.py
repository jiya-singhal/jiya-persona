"""OpenAI-compatible /v1/chat/completions for Vapi custom-LLM integration.

Vapi calls this exactly like an OpenAI endpoint. We translate the request to
Gemini, run RAG retrieval over the latest user turn, optionally execute tool
calls server-side, and return either:
  - non-streaming `chat.completion` JSON
  - streaming `chat.completion.chunk` SSE frames

Voice mode shortcuts (per BRIEF §8):
  - top-3 retrieved chunks (not 6) for shorter context
  - retrieval is gated to text turns; tool-result turns skip it
  - latency telemetry written via TurnTimer (channel="voice")
"""

import json
import logging
import time
import uuid
from typing import Any, AsyncIterator

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types
from pydantic import BaseModel

from app.agent.system_prompt import SYSTEM_PROMPT, build_user_turn
from app.calendar_integration.calcom import CalcomError, book_meeting, get_availability
from app.config import settings
from app.rag.retriever import query
from app.telemetry.latency_log import TurnTimer

logger = logging.getLogger(__name__)
router = APIRouter()

MODEL = "gemini-2.5-flash-lite"  # voice-only — chat keeps gemini-2.5-flash for groundedness
VOICE_TOP_K = 5

VOICE_GUARD = (
    "\n\n# Voice mode\n"
    "Reply in 2 to 4 short sentences. Never invent numbers, percentages, dates, "
    "or names — quote only what is in the retrieved context. If the context "
    "doesn't have it, say 'I don't have that detail in my materials.'"
)
MAX_TOOL_TURNS = 4


# ---------- OpenAI request/response shapes ----------

class OAIMessage(BaseModel):
    role: str  # "system" | "user" | "assistant" | "tool"
    content: str | None = None
    name: str | None = None
    tool_call_id: str | None = None
    tool_calls: list[dict[str, Any]] | None = None


class OAIToolFunction(BaseModel):
    name: str
    description: str | None = None
    parameters: dict[str, Any] | None = None


class OAITool(BaseModel):
    type: str
    function: OAIToolFunction


class OAIRequest(BaseModel):
    model: str | None = None
    messages: list[OAIMessage]
    stream: bool = False
    temperature: float | None = None
    max_tokens: int | None = None
    tools: list[OAITool] | None = None
    tool_choice: Any | None = None


# ---------- Translation helpers ----------

def _retrieve_for_voice(message: str) -> list[dict]:
    return query(
        voyage_api_key=settings.voyage_api_key,
        chroma_dir=str(settings.chroma_dir),
        query_text=message,
        source_filter="any",
        k=10,
        top_k_after_mmr=VOICE_TOP_K,
    )


def _to_gemini_contents(
    messages: list[OAIMessage], retrieved_chunks: list[dict]
) -> list[types.Content]:
    """Translate OpenAI message list → Gemini Contents.

    The latest user turn gets RAG context spliced in; older user turns are
    passed verbatim (their context was already used at the time).
    """
    contents: list[types.Content] = []
    last_user_idx = -1
    for i, m in enumerate(messages):
        if m.role == "user":
            last_user_idx = i

    for i, m in enumerate(messages):
        if m.role == "system":
            continue  # system handled via system_instruction
        if m.role == "user":
            text = m.content or ""
            if i == last_user_idx and retrieved_chunks:
                text = build_user_turn(text, retrieved_chunks)
            contents.append(
                types.Content(role="user", parts=[types.Part.from_text(text=text)])
            )
        elif m.role == "assistant":
            # Tool calls from a prior assistant turn aren't replayed here — Vapi
            # owns that history when it runs tool-calling itself. We just pass
            # the textual content if any.
            if m.content:
                contents.append(
                    types.Content(role="model", parts=[types.Part.from_text(text=m.content)])
                )
        elif m.role == "tool":
            # Tool result from Vapi side — represent as a user-side function response.
            try:
                result = json.loads(m.content) if m.content else {}
            except json.JSONDecodeError:
                result = {"raw": m.content}
            contents.append(
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_function_response(
                            name=m.name or "unknown_tool",
                            response=result,
                        )
                    ],
                )
            )
    return contents


def _to_gemini_tools(tools: list[OAITool] | None) -> list[types.Tool] | None:
    if not tools:
        return None
    decls: list[types.FunctionDeclaration] = []
    for t in tools:
        if t.type != "function":
            continue
        f = t.function
        params_schema = None
        if f.parameters:
            try:
                params_schema = _schema_from_dict(f.parameters)
            except Exception as e:
                logger.warning(f"could not translate tool {f.name} params: {e}")
        decls.append(
            types.FunctionDeclaration(
                name=f.name,
                description=f.description or "",
                parameters=params_schema,
            )
        )
    if not decls:
        return None
    return [types.Tool(function_declarations=decls)]


def _schema_from_dict(d: dict[str, Any]) -> types.Schema:
    """Recursively convert JSON-schema dict → google-genai Schema."""
    type_map = {
        "object": types.Type.OBJECT,
        "string": types.Type.STRING,
        "number": types.Type.NUMBER,
        "integer": types.Type.INTEGER,
        "boolean": types.Type.BOOLEAN,
        "array": types.Type.ARRAY,
    }
    t = type_map.get(d.get("type", "string"), types.Type.STRING)
    schema_kwargs: dict[str, Any] = {"type": t}
    if "description" in d:
        schema_kwargs["description"] = d["description"]
    if "enum" in d:
        schema_kwargs["enum"] = d["enum"]
    if t == types.Type.OBJECT and "properties" in d:
        schema_kwargs["properties"] = {
            k: _schema_from_dict(v) for k, v in d["properties"].items()
        }
        if "required" in d:
            schema_kwargs["required"] = d["required"]
    if t == types.Type.ARRAY and "items" in d:
        schema_kwargs["items"] = _schema_from_dict(d["items"])
    return types.Schema(**schema_kwargs)


# ---------- Server-side tool resolution (when no tools were provided by Vapi) ----------

async def _resolve_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    try:
        if name == "query_knowledge":
            chunks = query(
                voyage_api_key=settings.voyage_api_key,
                chroma_dir=str(settings.chroma_dir),
                query_text=args["query"],
                source_filter=args.get("source_filter", "any"),
                k=10,
                top_k_after_mmr=VOICE_TOP_K,
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


# ---------- Response shaping ----------

def _make_completion_id() -> str:
    return f"chatcmpl-{uuid.uuid4().hex[:24]}"


def _non_stream_response(
    completion_id: str, model: str, content: str, tool_calls: list[dict] | None = None
) -> dict[str, Any]:
    msg: dict[str, Any] = {"role": "assistant", "content": content or ""}
    if tool_calls:
        msg["tool_calls"] = tool_calls
        msg["content"] = msg["content"] or None
    return {
        "id": completion_id,
        "object": "chat.completion",
        "created": int(time.time()),
        "model": model,
        "choices": [
            {
                "index": 0,
                "message": msg,
                "finish_reason": "tool_calls" if tool_calls else "stop",
            }
        ],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


def _stream_chunk(
    completion_id: str, model: str, *, delta: dict[str, Any], finish_reason: str | None = None
) -> str:
    payload = {
        "id": completion_id,
        "object": "chat.completion.chunk",
        "created": int(time.time()),
        "model": model,
        "choices": [
            {"index": 0, "delta": delta, "finish_reason": finish_reason}
        ],
    }
    return f"data: {json.dumps(payload)}\n\n"


# ---------- Core handler ----------

async def _run_completion(
    body: OAIRequest, timer: TurnTimer
) -> tuple[str, list[dict] | None]:
    """Run Gemini (with optional server-side tool loop) and return (text, tool_calls_for_vapi).

    If Vapi provided tools, we DO NOT execute them — we return them in the response
    so Vapi handles the tool round-trip. If Vapi did NOT provide tools, we resolve
    server-side and return text only.
    """
    last_user = next(
        (m for m in reversed(body.messages) if m.role == "user"), None
    )
    user_text = (last_user.content or "") if last_user else ""

    chunks = _retrieve_for_voice(user_text) if user_text else []
    timer.mark_retrieval_end(len(chunks))

    contents = _to_gemini_contents(body.messages, chunks)

    # If Vapi provides tools, expose them and let Vapi own the tool loop.
    if body.tools:
        gemini_tools = _to_gemini_tools(body.tools)
        client = genai.Client(api_key=settings.gemini_api_key)
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT + VOICE_GUARD,
            temperature=body.temperature if body.temperature is not None else 0.3,
            max_output_tokens=body.max_tokens or 350,
            tools=gemini_tools,
        )
        response = await client.aio.models.generate_content(
            model=MODEL, contents=contents, config=config
        )
        timer.mark_first_token()
        candidate = response.candidates[0] if response.candidates else None
        if not candidate or not candidate.content or not candidate.content.parts:
            return "", None
        text_parts = [p.text for p in candidate.content.parts if p.text]
        tool_calls_oai: list[dict] = []
        for p in candidate.content.parts:
            fc = p.function_call
            if fc:
                tool_calls_oai.append(
                    {
                        "id": f"call_{uuid.uuid4().hex[:24]}",
                        "type": "function",
                        "function": {
                            "name": fc.name,
                            "arguments": json.dumps(dict(fc.args) if fc.args else {}),
                        },
                    }
                )
        return "".join(text_parts), tool_calls_oai or None

    # No tools from Vapi — run server-side tool loop using our own schemas.
    from app.agent.tools import GET_AVAILABILITY, BOOK_MEETING, QUERY_KNOWLEDGE

    server_tools = [types.Tool(function_declarations=[QUERY_KNOWLEDGE, GET_AVAILABILITY, BOOK_MEETING])]
    client = genai.Client(api_key=settings.gemini_api_key)
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=body.temperature if body.temperature is not None else 0.3,
        max_output_tokens=body.max_tokens or 350,
        tools=server_tools,
    )

    for _ in range(MAX_TOOL_TURNS):
        response = await client.aio.models.generate_content(
            model=MODEL, contents=contents, config=config
        )
        candidate = response.candidates[0] if response.candidates else None
        if not candidate or not candidate.content or not candidate.content.parts:
            return "", None

        function_calls = [p.function_call for p in candidate.content.parts if p.function_call]
        if not function_calls:
            timer.mark_first_token()
            text_parts = [p.text for p in candidate.content.parts if p.text]
            return "".join(text_parts), None

        contents.append(candidate.content)
        tool_response_parts: list[types.Part] = []
        for fc in function_calls:
            args = dict(fc.args) if fc.args else {}
            timer.increment_tool_call()
            result = await _resolve_tool(fc.name, args)
            tool_response_parts.append(
                types.Part.from_function_response(name=fc.name, response=result)
            )
        contents.append(types.Content(role="user", parts=tool_response_parts))

    return "(tool loop limit exceeded)", None


# ---------- Routes ----------

@router.post("/v1/chat/completions")
async def chat_completions(
    body: OAIRequest,
    authorization: str | None = Header(default=None),
):
    if not settings.gemini_api_key:
        raise HTTPException(500, "GEMINI_API_KEY not set")

    last_user = next((m for m in reversed(body.messages) if m.role == "user"), None)
    timer = TurnTimer(channel="voice", message=(last_user.content if last_user else "") or "")
    completion_id = _make_completion_id()
    model = body.model or MODEL

    if not body.stream:
        try:
            text, tool_calls = await _run_completion(body, timer)
            timer.finish()
            return _non_stream_response(completion_id, model, text, tool_calls)
        except Exception as e:
            logger.exception("openai_compat error")
            timer.fail(str(e))
            timer.finish()
            raise HTTPException(500, f"completion failed: {e}")

    async def stream() -> AsyncIterator[str]:
        yield _stream_chunk(completion_id, model, delta={"role": "assistant"})
        try:
            async for chunk in _stream_completion(body, timer):
                yield chunk
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.exception("openai_compat stream error")
            timer.fail(str(e))
            yield _stream_chunk(
                completion_id, model, delta={"content": f"error: {e}"}, finish_reason="stop"
            )
            yield "data: [DONE]\n\n"
        finally:
            timer.finish()

    async def _stream_completion(body: OAIRequest, timer: TurnTimer) -> AsyncIterator[str]:
        """Run Gemini and yield OpenAI-format chunks token-by-token."""
        from app.agent.tools import GET_AVAILABILITY, BOOK_MEETING, QUERY_KNOWLEDGE

        last_user = next((m for m in reversed(body.messages) if m.role == "user"), None)
        user_text = (last_user.content or "") if last_user else ""

        chunks_retrieved = _retrieve_for_voice(user_text) if user_text else []
        timer.mark_retrieval_end(len(chunks_retrieved))

        contents = _to_gemini_contents(body.messages, chunks_retrieved)

        if body.tools:
            gemini_tools = _to_gemini_tools(body.tools)
            client = genai.Client(api_key=settings.gemini_api_key)
            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT + VOICE_GUARD,
                temperature=body.temperature if body.temperature is not None else 0.3,
                max_output_tokens=body.max_tokens or 350,
                tools=gemini_tools,
            )
            tool_calls_oai: list[dict] = []
            saw_text = False
            async for part in await client.aio.models.generate_content_stream(
                model=MODEL, contents=contents, config=config
            ):
                cand = part.candidates[0] if part.candidates else None
                if not cand or not cand.content:
                    continue
                for p in cand.content.parts or []:
                    if p.text:
                        if not saw_text:
                            timer.mark_first_token()
                            saw_text = True
                        yield _stream_chunk(completion_id, model, delta={"content": p.text})
                    if p.function_call:
                        fc = p.function_call
                        tool_calls_oai.append({
                            "id": f"call_{uuid.uuid4().hex[:24]}",
                            "type": "function",
                            "function": {
                                "name": fc.name,
                                "arguments": json.dumps(dict(fc.args) if fc.args else {}),
                            },
                        })
            if tool_calls_oai:
                yield _stream_chunk(completion_id, model, delta={"tool_calls": tool_calls_oai})
                yield _stream_chunk(completion_id, model, delta={}, finish_reason="tool_calls")
            else:
                yield _stream_chunk(completion_id, model, delta={}, finish_reason="stop")
            return

        # Server-side tool loop with streaming on the FINAL turn only
        server_tools = [types.Tool(function_declarations=[QUERY_KNOWLEDGE, GET_AVAILABILITY, BOOK_MEETING])]
        client = genai.Client(api_key=settings.gemini_api_key)
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT + VOICE_GUARD,
            temperature=body.temperature if body.temperature is not None else 0.3,
            max_output_tokens=body.max_tokens or 350,
            tools=server_tools,
        )

        for turn_idx in range(MAX_TOOL_TURNS):
            saw_text = False
            saw_function_call = False
            collected_function_calls: list[Any] = []
            collected_text_parts: list[str] = []
            assistant_content_parts: list[types.Part] = []

            async for evt in await client.aio.models.generate_content_stream(
                model=MODEL, contents=contents, config=config
            ):
                cand = evt.candidates[0] if evt.candidates else None
                if not cand or not cand.content:
                    continue
                for p in cand.content.parts or []:
                    if p.text:
                        if not saw_text:
                            timer.mark_first_token()
                            saw_text = True
                        yield _stream_chunk(completion_id, model, delta={"content": p.text})
                        collected_text_parts.append(p.text)
                        assistant_content_parts.append(p)
                    if p.function_call:
                        saw_function_call = True
                        collected_function_calls.append(p.function_call)
                        assistant_content_parts.append(p)

            if not saw_function_call:
                yield _stream_chunk(completion_id, model, delta={}, finish_reason="stop")
                return

            # Tool round: append the assistant turn (with function calls) and resolve
            contents.append(types.Content(role="model", parts=assistant_content_parts))
            tool_response_parts: list[types.Part] = []
            for fc in collected_function_calls:
                args = dict(fc.args) if fc.args else {}
                timer.increment_tool_call()
                result = await _resolve_tool(fc.name, args)
                tool_response_parts.append(
                    types.Part.from_function_response(name=fc.name, response=result)
                )
            contents.append(types.Content(role="user", parts=tool_response_parts))

        yield _stream_chunk(completion_id, model, delta={"content": "(tool loop limit)"}, finish_reason="stop")

    return StreamingResponse(stream(), media_type="text/event-stream")
