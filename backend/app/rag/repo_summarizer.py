"""Generate Repo Cards via Gemini 2.5 Flash auto-summarization, with disk caching."""

import json
import logging
from pathlib import Path

from google import genai
from google.genai import types

from app.rag.github_ingest import RepoData

logger = logging.getLogger(__name__)

MODEL = "gemini-2.5-flash"

REPO_CARD_PROMPT = """You are analyzing a GitHub repository to produce a structured factual summary
for a RAG system. Read the provided files and metadata. Output ONLY what you
can directly infer from the code — no speculation, no filler, no marketing language.

If you cannot determine something from the provided files, write "unclear from
provided files" for that field. Do NOT guess.

Output JSON with this schema:
{
  "repo_name": "...",
  "one_line_purpose": "...",
  "problem_solved": "...",
  "tech_stack": {
    "languages": [...],
    "frameworks": [...],
    "key_libraries": [...],
    "storage": "...",
    "deployment": "..."
  },
  "architecture_summary": "...",
  "key_features": [...],
  "notable_code_decisions": [...],
  "tradeoffs_and_limitations": [...],
  "complexity_level": "beginner|intermediate|advanced",
  "what_it_demonstrates": "..."
}

Output ONLY the JSON object."""


def _build_context(repo_data: RepoData) -> str:
    parts = [
        f"Repository: {repo_data.full_name}",
        f"Description: {repo_data.description or 'None'}",
        f"Languages: {json.dumps(repo_data.languages)}",
        f"Stars: {repo_data.stars}",
        f"Total commits: {repo_data.total_commits}",
        f"Created: {repo_data.created_at}",
        f"Last commit: {repo_data.last_commit_date}",
        f"Default branch: {repo_data.default_branch}",
        f"\nFile tree ({len(repo_data.file_tree)} files):",
        "\n".join(f"  {f}" for f in repo_data.file_tree[:100]),
        "\n--- Selected file contents ---\n",
    ]
    for path, content in repo_data.selected_files.items():
        truncated = content[:8000] if len(content) > 8000 else content
        parts.append(f"\n=== {path} ===\n{truncated}")
    return "\n".join(parts)


def _parse_card(text: str) -> dict | None:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def generate_repo_card(
    gemini_api_key: str,
    repo_data: RepoData,
    cache_dir: Path,
) -> dict:
    cache_file = cache_dir / f"{repo_data.name}.json"

    if cache_file.exists():
        cached = json.loads(cache_file.read_text())
        if cached.get("_last_commit") == repo_data.last_commit_date:
            logger.info(f"Using cached Repo Card for {repo_data.name}")
            return cached

    logger.info(f"Generating Repo Card for {repo_data.name} via Gemini 2.5 Flash...")
    client = genai.Client(api_key=gemini_api_key)
    context = _build_context(repo_data)

    card = None
    for attempt in range(2):
        response = client.models.generate_content(
            model=MODEL,
            contents=f"{REPO_CARD_PROMPT}\n\n--- Repository data ---\n{context}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                max_output_tokens=8000,
            ),
        )
        card = _parse_card(response.text or "")
        if card:
            break
        logger.warning(
            f"Failed to parse Repo Card for {repo_data.name}, attempt {attempt + 1}; "
            f"finish_reason={getattr(response.candidates[0], 'finish_reason', 'unknown') if response.candidates else 'no_candidates'}"
        )

    if not card:
        logger.error(f"Could not generate Repo Card for {repo_data.name}")
        card = {
            "repo_name": repo_data.name,
            "one_line_purpose": "Failed to generate summary",
            "error": True,
        }

    card["_last_commit"] = repo_data.last_commit_date
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(json.dumps(card, indent=2))
    logger.info(f"Cached Repo Card for {repo_data.name}")
    return card
