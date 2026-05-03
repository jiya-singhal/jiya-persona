"""Parse resume PDF into section-based chunks with metadata."""

import re
from pathlib import Path
from pypdf import PdfReader


# Section headers commonly found in resumes
SECTION_PATTERNS = [
    (r"(?i)\b(experience|work\s+experience|professional\s+experience)\b", "experience"),
    (r"(?i)\b(education|academic)\b", "education"),
    (r"(?i)\b(skills|technical\s+skills|technologies)\b", "skills"),
    (r"(?i)\b(projects|personal\s+projects|academic\s+projects)\b", "projects"),
    (r"(?i)\b(certifications?|certificates?)\b", "certifications"),
    (r"(?i)\b(achievements?|awards?|honors?)\b", "achievements"),
    (r"(?i)\b(summary|objective|profile)\b", "summary"),
    (r"(?i)\b(extracurricular|activities|interests)\b", "extracurricular"),
    (r"(?i)\b(publications?|research)\b", "publications"),
    (r"(?i)\b(volunteer|community)\b", "volunteer"),
    (r"(?i)\b(leadership|positions?\s+of\s+responsibility)\b", "leadership"),
]


def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n".join(pages)


def detect_section(line: str) -> str | None:
    stripped = line.strip()
    if not stripped or len(stripped) > 80:
        return None
    for pattern, section_name in SECTION_PATTERNS:
        if re.search(pattern, stripped):
            return section_name
    return None


def _detect_company(text: str) -> str:
    companies = ["SingOneSong", "TradeIndia", "Scaler", "BITS Pilani"]
    for c in companies:
        if c.lower() in text.lower():
            return c
    return ""


def split_into_sections(full_text: str) -> list[dict]:
    lines = full_text.split("\n")
    sections = []
    current_section = "header"
    current_lines: list[str] = []

    for line in lines:
        detected = detect_section(line)
        if detected and detected != current_section:
            if current_lines:
                sections.append({
                    "section": current_section,
                    "text": "\n".join(current_lines).strip(),
                })
            current_section = detected
            current_lines = [line]
        else:
            current_lines.append(line)

    if current_lines:
        sections.append({
            "section": current_section,
            "text": "\n".join(current_lines).strip(),
        })

    return sections


def chunk_section(section: dict) -> list[dict]:
    """Break a section into granular chunks, especially for bullet-heavy content."""
    text = section["text"]
    section_name = section["section"]

    if not text.strip():
        return []

    # For experience/projects, split by bullet groups (company/project blocks)
    if section_name in ("experience", "projects"):
        return _chunk_by_blocks(text, section_name)

    # For others, keep as one chunk if short enough, else split by paragraphs
    if len(text) < 800:
        return [_make_chunk(text, section_name)]

    paragraphs = re.split(r"\n\s*\n", text)
    chunks = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) > 600:
            if current.strip():
                chunks.append(_make_chunk(current.strip(), section_name))
            current = para
        else:
            current += "\n\n" + para if current else para
    if current.strip():
        chunks.append(_make_chunk(current.strip(), section_name))
    return chunks


def _chunk_by_blocks(text: str, section_name: str) -> list[dict]:
    """Split experience/projects into blocks based on lines that look like headers
    (short lines without bullet markers)."""
    lines = text.split("\n")
    blocks: list[list[str]] = []
    current_block: list[str] = []

    for line in lines:
        stripped = line.strip()
        # Heuristic: a new block starts with a non-bullet, non-empty short line
        is_bullet = stripped.startswith(("•", "-", "–", "▪", "*", "◦"))
        is_short_header = (
            stripped
            and not is_bullet
            and len(stripped) < 120
            and current_block
            and any(l.strip().startswith(("•", "-", "–")) for l in current_block)
        )
        if is_short_header:
            blocks.append(current_block)
            current_block = [line]
        else:
            current_block.append(line)

    if current_block:
        blocks.append(current_block)

    chunks = []
    for block in blocks:
        block_text = "\n".join(block).strip()
        if not block_text:
            continue
        company = _detect_company(block_text)

        # Further split large blocks: each bullet as its own chunk for granularity
        bullet_lines = []
        current_bullet = ""
        header_lines = []
        for line in block:
            stripped = line.strip()
            if stripped.startswith(("•", "-", "–", "▪", "*", "◦")):
                if current_bullet:
                    bullet_lines.append(current_bullet)
                current_bullet = stripped
            elif current_bullet:
                current_bullet += " " + stripped
            else:
                header_lines.append(stripped)

        if current_bullet:
            bullet_lines.append(current_bullet)

        header = "\n".join(h for h in header_lines if h).strip()

        if not bullet_lines:
            chunks.append(_make_chunk(block_text, section_name, company=company))
        else:
            # Block-level chunk (full context)
            chunks.append(_make_chunk(block_text, section_name, company=company))
            # Individual bullet chunks (granular facts)
            for bullet in bullet_lines:
                fact = f"{header}\n{bullet}" if header else bullet
                if len(fact.strip()) > 30:
                    chunks.append(_make_chunk(
                        fact.strip(), section_name,
                        company=company, granularity="bullet",
                    ))

    return chunks


def _make_chunk(
    text: str, section: str, company: str = "", granularity: str = "section"
) -> dict:
    meta = {
        "source_type": "resume",
        "section": section,
        "granularity": granularity,
    }
    if company:
        meta["company"] = company
    return {"text": text, "metadata": meta}


def ingest_resume(pdf_path: Path) -> list[dict]:
    full_text = extract_text(pdf_path)
    sections = split_into_sections(full_text)
    all_chunks = []
    for section in sections:
        all_chunks.extend(chunk_section(section))
    return all_chunks
