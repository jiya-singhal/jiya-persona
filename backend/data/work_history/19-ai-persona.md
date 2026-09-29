---
title: The AI persona (this site): a RAG-grounded AI representative with voice, chat, booking and an eval harness
company: personal project
period: May - Sep 2026
tags: rag, chromadb, voyage, gemini, fastapi, next.js, vapi, cal.com, llm-as-judge, evals
---
## What it is
"Don't just read my resume. Interview it." A voice and chat persona that answers questions about Jiya and can book a real meeting on her calendar. Frontend in Next.js on Vercel; backend in FastAPI on Render; voice through Vapi with an OpenAI-compatible endpoint; booking through the Cal.com API. Repository jiya-singhal/jiya-persona, live at jiya-persona.vercel.app.

## How retrieval works
Her resume PDF, a set of curated work-history notes, and auto-summarised "repo cards" for 13 public GitHub repositories are chunked, embedded with Voyage AI, and stored in ChromaDB. A question is embedded, the nearest chunks are retrieved with a diversity pass so near-identical chunks do not crowd out the useful one, and the chunks are given to Gemini 2.5 Flash with a system prompt that forbids claims not supported by the retrieved context. Sources are cited under every answer. The corpus is baked into the backend's Docker image, and a GitHub Action refreshes it.

## How it is tested
An LLM-as-judge eval harness runs 30 questions, including adversarial prompts written to break grounding, against the running backend and scores groundedness, relevance, honesty and completeness. The August 2026 run on the old corpus scored groundedness 0.92 with a 9.1 percent hallucination rate. The 30 September 2026 run, after the corpus was rebuilt from the new resume and the curated work notes, scored groundedness 0.995, honesty 0.995, relevance 0.987, completeness 0.878, with zero hallucinated claims; the one failing case was a meeting booking blocked by an expired calendar API key, not by the model. Two earlier bugs the eval exposed that day: Gemini's thinking tokens were counted against a 600-token output cap and cut answers mid-sentence, and the judge itself was reading only the first 500 characters of each source chunk.

## House rule
Never inflate. The site publishes voicequal's real benchmark as-is, labels the in-browser demo an estimate, and corrected its own numbers when the evidence said so (for example, the voice pipeline is stated as 57 to 37 seconds cold, not 57 to 15).

## Design
Two full design systems have shipped and been iterated: a cream-and-cocoa first pass, a dark "Midnight Lab" system with a 2 AM mode, and, as of September 2026, "Daydream", a cream dot-grid notebook with pastel sticker cards and line drawings taken from the work itself (waveforms, pitch contours, hash rings).
