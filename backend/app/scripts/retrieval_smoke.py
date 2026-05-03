"""Phase 1 acceptance smoke test: 5 retrieval queries, top-6 chunks each.

Usage:
    python -m app.scripts.retrieval_smoke
"""

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.config import settings
from app.rag.retriever import query

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


QUERIES = [
    ("resume", "What did Jiya do at SingOneSong?", "resume"),
    ("repo_high_level", "Tell me about the search-listings project", "github"),
    ("repo_tradeoffs", "What are the tradeoffs in the Social Network Friend Recommendation project?", "github"),
    ("cross_repo", "Which of Jiya's repos demonstrates backend skills?", "github"),
    ("ambiguous", "What's Jiya's biggest technical win?", "any"),
]


def main():
    if not settings.voyage_api_key:
        logger.error("VOYAGE_API_KEY not set")
        sys.exit(1)

    chroma_dir = str(settings.chroma_dir)

    for label, q, source_filter in QUERIES:
        print("\n" + "=" * 80)
        print(f"[{label}] filter={source_filter}")
        print(f"Q: {q}")
        print("-" * 80)
        results = query(
            voyage_api_key=settings.voyage_api_key,
            chroma_dir=chroma_dir,
            query_text=q,
            source_filter=source_filter,
            k=12,
            top_k_after_mmr=6,
        )
        if not results:
            print("  (no results)")
            continue
        for i, r in enumerate(results, 1):
            meta = r["metadata"]
            score = r["score"]
            preview = r["text"].replace("\n", " ")[:200]
            print(f"  #{i} score={score:.3f} meta={meta}")
            print(f"      {preview}...")


if __name__ == "__main__":
    main()
