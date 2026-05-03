"""Tool schemas for Gemini function-calling.

Used in the voice path (Phase 5) where Gemini orchestrates tool calls. In the
chat path (Phase 2), retrieval is done before the LLM call and these tools are
not exposed; only `get_availability`/`book_meeting` will be wired into chat in
Phase 3 once Cal.com is integrated.
"""

from google.genai import types


QUERY_KNOWLEDGE = types.FunctionDeclaration(
    name="query_knowledge",
    description=(
        "Retrieve facts about Jiya from her resume and GitHub repos. Call this for ANY "
        "factual question about her background, projects, skills, or experience. Returns "
        "relevant chunks with source metadata."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "query": types.Schema(
                type=types.Type.STRING,
                description="The user's question, rephrased as a retrieval query.",
            ),
            "source_filter": types.Schema(
                type=types.Type.STRING,
                description="Restrict to resume, github, or any.",
                enum=["resume", "github", "any"],
            ),
        },
        required=["query"],
    ),
)


GET_AVAILABILITY = types.FunctionDeclaration(
    name="get_availability",
    description=(
        "Fetch real available time slots from Jiya's Cal.com calendar. Call this when "
        "the user wants to book or wants to know when Jiya is free."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "start_date": types.Schema(
                type=types.Type.STRING,
                description="ISO date, start of window (e.g., 2026-05-05).",
            ),
            "end_date": types.Schema(
                type=types.Type.STRING,
                description="ISO date, end of window.",
            ),
            "timezone": types.Schema(
                type=types.Type.STRING,
                description="IANA timezone, default Asia/Kolkata.",
            ),
        },
        required=["start_date", "end_date"],
    ),
)


BOOK_MEETING = types.FunctionDeclaration(
    name="book_meeting",
    description=(
        "Book a meeting on Jiya's calendar. Only call after the user has confirmed a "
        "specific slot AND provided their name and email."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "slot_start": types.Schema(
                type=types.Type.STRING,
                description="ISO timestamp of the chosen slot.",
            ),
            "attendee_name": types.Schema(type=types.Type.STRING),
            "attendee_email": types.Schema(type=types.Type.STRING),
            "notes": types.Schema(
                type=types.Type.STRING,
                description="Optional context from the conversation.",
            ),
        },
        required=["slot_start", "attendee_name", "attendee_email"],
    ),
)


ALL_TOOLS = types.Tool(
    function_declarations=[QUERY_KNOWLEDGE, GET_AVAILABILITY, BOOK_MEETING],
)
