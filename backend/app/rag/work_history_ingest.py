"""Parse curated work-history notes (backend/data/work_history/*.md) into chunks.

Each note is one story: a small front-matter block (title, company, period,
tags) followed by `## ` sections. Every section becomes one chunk, prefixed
with the note's title and period so a chunk read on its own still says what
it is about. Metadata lets the retriever treat these like resume material
(they are the private-repo work the resume summarises) and lets the UI label
them.
"""

import re
from pathlib import Path

FRONT_MATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)
SECTION_SPLIT = re.compile(r"^##\s+", re.MULTILINE)


def _parse_front_matter(text: str) -> tuple[dict, str]:
    meta: dict[str, str] = {}
    m = FRONT_MATTER.match(text)
    if not m:
        return meta, text
    for line in m.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    return meta, text[m.end():]


def chunk_note(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    meta, body = _parse_front_matter(text)
    title = meta.get("title", path.stem)
    company = meta.get("company", "")
    period = meta.get("period", "")
    topic = re.sub(r"^\d+-", "", path.stem)

    chunks: list[dict] = []
    for raw in SECTION_SPLIT.split(body):
        raw = raw.strip()
        if not raw:
            continue
        heading, _, section_body = raw.partition("\n")
        section_body = section_body.strip()
        if not section_body:
            continue
        header = f"{title} ({period})" if period else title
        chunk_text = f"{header}\n{heading.strip()}\n{section_body}"
        chunks.append({
            "text": chunk_text,
            "metadata": {
                "source_type": "work_story",
                "topic": topic,
                "title": title,
                "section": heading.strip(),
                "company": company,
                "period": period,
                "granularity": "section",
            },
        })
    return chunks


def ingest_work_history(notes_dir: Path) -> list[dict]:
    if not notes_dir.exists():
        return []
    chunks: list[dict] = []
    for path in sorted(notes_dir.glob("*.md")):
        chunks.extend(chunk_note(path))
    return chunks
