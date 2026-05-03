"""Chunk repo cards and source code for ingestion into ChromaDB."""

import json


def chunk_repo_card(card: dict, repo_name: str) -> list[dict]:
    """Create card-level and field-level chunks from a Repo Card."""
    chunks = []

    # Card-level: the full card as one chunk
    card_text = json.dumps({k: v for k, v in card.items() if not k.startswith("_")}, indent=2)
    chunks.append({
        "text": card_text,
        "metadata": {
            "source_type": "github_card",
            "repo": repo_name,
            "granularity": "card",
        },
    })

    # Field-level chunks
    field_mappings = {
        "one_line_purpose": "purpose",
        "problem_solved": "problem",
        "architecture_summary": "architecture",
        "what_it_demonstrates": "demonstrates",
    }
    for field, label in field_mappings.items():
        if field in card and card[field]:
            chunks.append({
                "text": f"{repo_name} — {label}: {card[field]}",
                "metadata": {
                    "source_type": "github_card",
                    "repo": repo_name,
                    "field": label,
                    "granularity": "field",
                },
            })

    # List fields
    list_fields = {
        "key_features": "features",
        "notable_code_decisions": "code_decisions",
        "tradeoffs_and_limitations": "tradeoffs",
    }
    for field, label in list_fields.items():
        if field in card and card[field]:
            items = card[field]
            if isinstance(items, list):
                text = f"{repo_name} — {label}:\n" + "\n".join(f"• {item}" for item in items)
            else:
                text = f"{repo_name} — {label}: {items}"
            chunks.append({
                "text": text,
                "metadata": {
                    "source_type": "github_card",
                    "repo": repo_name,
                    "field": label,
                    "granularity": "field",
                },
            })

    # Tech stack as its own chunk
    if "tech_stack" in card:
        ts = card["tech_stack"]
        text = f"{repo_name} — tech stack: {json.dumps(ts)}"
        chunks.append({
            "text": text,
            "metadata": {
                "source_type": "github_card",
                "repo": repo_name,
                "field": "tech_stack",
                "granularity": "field",
            },
        })

    return chunks


def chunk_source_code(
    files: dict[str, str], repo_name: str, chunk_size: int = 800, overlap: int = 100
) -> list[dict]:
    """Chunk raw source files at ~800 tokens (chars as proxy) with overlap."""
    chunks = []
    for file_path, content in files.items():
        if not content.strip():
            continue

        # Simple char-based chunking (rough token proxy)
        text = content
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk_text = text[start:end]
            if chunk_text.strip():
                chunks.append({
                    "text": f"File: {file_path} (repo: {repo_name})\n\n{chunk_text}",
                    "metadata": {
                        "source_type": "github_code",
                        "repo": repo_name,
                        "file_path": file_path,
                        "granularity": "code",
                    },
                })
            start = end - overlap if end < len(text) else end

    return chunks
