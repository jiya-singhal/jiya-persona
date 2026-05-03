"""Generate the 1-page evals PDF from results/latest.json.

Usage:
    python evals/generate_report.py
"""

import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parent
LATEST = ROOT / "results" / "latest.json"
OUT_PDF = ROOT / "results" / "Jiya-Persona-Evals.pdf"


# These three failure modes were observed live during phases 2-5; they're real.
FAILURE_MODES = [
    {
        "name": "Booking turns retrieve irrelevant chunks",
        "what": "When the user asks 'Can I talk to Jiya next week?' the RAG layer still fetches top-6 chunks (often Java, weather-app JS, social-network Java code) — useless for booking. The LLM ignores them and calls get_availability correctly, but it wastes a Voyage API call and clutters the UI source list.",
        "fix": "Add an intent classifier in front of retrieval — skip RAG entirely when the message is booking intent or when the model has just emitted a tool call.",
    },
    {
        "name": "Voice mode hallucinated numbers (fixed mid-build)",
        "what": "First voice smoke test produced 'improving relevance from 89% to 96% accuracy' for the search-listings repo — those numbers are nowhere in the card. Root cause: voice context was top-3 chunks (vs top-6 for chat), giving the model less to anchor on, plus the chat system prompt didn't repeat the no-fabrication rule explicitly enough for the lower-context regime.",
        "fix": "Bumped voice retrieval to top-5 and appended a voice-mode addendum to the system prompt: 'Never invent numbers, percentages, dates, or names — quote only what is in the retrieved context.' Re-tested; hallucination did not recur.",
    },
    {
        "name": "Cross-repo FAISS fabrication leaks into TradeIndia narrative",
        "what": "When asked 'What did Jiya build at TradeIndia?' or 'Why should we hire Jiya?', the chat agent occasionally describes the TradeIndia work as 'FAISS vector search with sentence embeddings, improving relevance from 89% to 96%'. The resume says 'FAISS-based product search' (correct) but does not contain 'sentence embeddings' or the specific 89%/96% numbers — those leak in from the search-listings repo card, which DOES contain that combination. Caught by the eval (factual_5, fit_1) — groundedness 0.5 and 0.7 respectively.",
        "fix": "Tighten retrieval intent: when the question mentions a specific employer (TradeIndia, SingOneSong), filter github_card chunks at retrieval time. Today retrieval mixes resume bullets and repo cards by default, and the model attributes card details to the resume context. Two-week roadmap item.",
    },
]


ROADMAP = [
    "Reranker on top of dense retrieval (Voyage rerank-2-lite) — would close the booking-turn irrelevance gap and tighten cross-repo questions.",
    "Multi-turn booking state machine — currently relies on Gemini following the conversation; a dedicated state ('proposed slots' → 'awaiting attendee info' → 'confirmed') would make booking deterministic.",
    "Ingest the SingOneSong private repo via a CI-side ingestion job (without committing the source) — the persona's strongest material is in private repos and the current resume-only path leaves accuracy on the table.",
    "Voice voice-cloning with my own audio via ElevenLabs custom voice instead of the default voice — a small thing that makes the AI rep feel more like Jiya specifically.",
    "Multilingual fallback (Hindi → English handoff) for the phone path — Vapi supports it; the current Deepgram config is en-only.",
]


def make_para(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, style)


def main() -> None:
    if not LATEST.exists():
        raise SystemExit(f"missing {LATEST} — run run_evals.py first")

    data = json.loads(LATEST.read_text())
    summary = data["summary"]
    results = data["results"]

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontSize=13, spaceAfter=1, spaceBefore=0, leading=15)
    sub = ParagraphStyle("sub", parent=styles["Normal"], fontSize=7.5, textColor=colors.HexColor("#6B6760"), spaceAfter=4, leading=9)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontSize=9.5, spaceBefore=5, spaceAfter=2, leading=11, textColor=colors.HexColor("#A8593A"))
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=7.5, leading=9.5, spaceAfter=1)
    bullet = ParagraphStyle("bullet", parent=body, leftIndent=10, bulletIndent=0, spaceAfter=1)
    failure_what = ParagraphStyle("fw", parent=body, leftIndent=8, fontSize=7, leading=9, textColor=colors.HexColor("#222222"))

    doc = SimpleDocTemplate(
        str(OUT_PDF),
        pagesize=LETTER,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.4 * inch,
        bottomMargin=0.35 * inch,
    )

    story = []

    story.append(make_para("Jiya Singhal — AI Persona Evals", h1))
    story.append(make_para(
        f"Run {data.get('run_at', '?')}  ·  judge: {data.get('judge_model', '?')}  "
        f"·  backend: {data.get('prod_url', '?')}",
        sub,
    ))

    story.append(make_para("Methodology", h2))
    story.append(make_para(
        f"Test set of {summary['n']} questions covering factual recall (×6), repo depth (×5), fit (×3), "
        f"adversarial refusals (×4), and booking intent (×2). Each chat turn is sent to the live "
        f"prod backend, top-6 retrieved chunks are passed to the judge alongside the answer. The judge "
        f"is Gemini 2.5 Flash with a JSON-mode rubric scoring groundedness, relevance, honesty, and "
        f"completeness on a 0–1 scale. Hallucination rate is the fraction of answers with groundedness < 0.8. "
        f"Latency is end-to-end /chat round-trip (includes retrieval + Gemini streaming).",
        body,
    ))

    # ---- numbers table ----
    means = summary["axis_means"]
    halluc = summary["hallucination_rate"]
    p50 = summary["chat_latency_p50_ms"]
    p95 = summary["chat_latency_p95_ms"]

    table_data = [
        ["metric", "value"],
        ["groundedness (mean)", f"{means.get('groundedness', '?')}"],
        ["relevance (mean)", f"{means.get('relevance', '?')}"],
        ["honesty (mean)", f"{means.get('honesty', '?')}"],
        ["completeness (mean)", f"{means.get('completeness', '?')}"],
        ["hallucination rate (groundedness < 0.8)", f"{halluc * 100:.1f}%"],
        ["chat latency p50 / p95", f"{p50:.0f} ms  /  {p95:.0f} ms"],
        ["voice ttft p50 / p95 (Phase 5 prod smoke)", "1.0 s  /  3.5 s  ·  target <2 s"],
        ["task completion: booking turn produced real Cal.com event", "see test_set booking_2"],
    ]
    t = Table(table_data, colWidths=[3.2 * inch, 3.7 * inch])
    t.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 7.5),
        ("FONT", (0, 1), (-1, -1), "Helvetica", 7.5),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F0ECE3")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAFAF7")]),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#A8593A")),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
    ]))
    story.append(t)

    # ---- per-category breakdown ----
    by_cat = summary.get("by_category", {})
    cat_data = [["category", "g", "r", "h", "c"]]
    for cat, axes in by_cat.items():
        cat_data.append([
            cat,
            f"{axes.get('groundedness', '?')}",
            f"{axes.get('relevance', '?')}",
            f"{axes.get('honesty', '?')}",
            f"{axes.get('completeness', '?')}",
        ])
    ct = Table(cat_data, colWidths=[1.4 * inch, 1.0 * inch, 1.0 * inch, 1.0 * inch, 1.0 * inch])
    ct.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 7.5),
        ("FONT", (0, 1), (-1, -1), "Helvetica", 7.5),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F0ECE3")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAFAF7")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
    ]))
    story.append(Spacer(1, 3))
    story.append(make_para("Per-category means (groundedness · relevance · honesty · completeness)", sub))
    story.append(ct)

    # ---- failure modes ----
    story.append(make_para("3 failure modes found + fixes", h2))
    for f in FAILURE_MODES:
        story.append(make_para(f"<b>{f['name']}</b>", body))
        story.append(make_para(f"<i>What:</i> {f['what']}", failure_what))
        story.append(make_para(f"<i>Fix:</i> {f['fix']}", failure_what))
        story.append(Spacer(1, 1.5))

    # ---- roadmap ----
    story.append(make_para("With 2 more weeks I'd improve", h2))
    for i, item in enumerate(ROADMAP, 1):
        story.append(make_para(f"{i}. {item}", bullet))

    doc.build(story)
    print(f"Wrote {OUT_PDF}")


if __name__ == "__main__":
    main()
