"""CLI for re-ingesting resume and GitHub repos into ChromaDB.

Usage:
    python -m app.scripts.reingest              # full rebuild
    python -m app.scripts.reingest --repos-only  # skip resume
    python -m app.scripts.reingest --force-cards # regenerate Repo Cards even if cached
"""

import argparse
import json
import logging
import sys
from pathlib import Path

# Ensure backend/ is on the path when run as module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.config import settings
from app.rag.resume_ingest import ingest_resume
from app.rag.github_ingest import fetch_repo
from app.rag.repo_summarizer import generate_repo_card
from app.rag.chunking import chunk_repo_card, chunk_source_code
from app.rag.retriever import get_chroma_client, get_or_create_collection, ingest_chunks

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


def clear_collection():
    """Delete and recreate the collection for a clean rebuild."""
    client = get_chroma_client(str(settings.chroma_dir))
    try:
        client.delete_collection("jiya_persona")
        logger.info("Deleted existing collection")
    except Exception:
        pass
    get_or_create_collection(client)


def run_resume_ingestion() -> list[dict]:
    logger.info(f"Parsing resume from {settings.resume_path}")
    chunks = ingest_resume(settings.resume_path)
    logger.info(f"Resume produced {len(chunks)} chunks")
    for c in chunks[:3]:
        logger.info(f"  Sample: [{c['metadata']['section']}] {c['text'][:80]}...")
    return chunks


def run_repo_ingestion(force_cards: bool = False) -> list[dict]:
    all_chunks = []
    settings.repo_cards_dir.mkdir(parents=True, exist_ok=True)

    for repo_name in settings.github_repos:
        logger.info(f"\n{'='*60}\nFetching {repo_name}...")
        repo_data = fetch_repo(settings.github_token, repo_name)
        logger.info(
            f"  {repo_data.name}: {len(repo_data.file_tree)} files, "
            f"{len(repo_data.selected_files)} selected, "
            f"{repo_data.total_commits} commits"
        )

        # Generate or load cached Repo Card
        if force_cards:
            # Delete cache to force regeneration
            cache_file = settings.repo_cards_dir / f"{repo_data.name}.json"
            if cache_file.exists():
                cache_file.unlink()

        card = generate_repo_card(
            settings.gemini_api_key, repo_data, settings.repo_cards_dir
        )
        logger.info(f"  Card purpose: {card.get('one_line_purpose', 'N/A')}")

        # Chunk the card
        card_chunks = chunk_repo_card(card, repo_data.name)
        logger.info(f"  Card chunks: {len(card_chunks)}")

        # Chunk source code
        code_chunks = chunk_source_code(repo_data.selected_files, repo_data.name)
        logger.info(f"  Code chunks: {len(code_chunks)}")

        all_chunks.extend(card_chunks)
        all_chunks.extend(code_chunks)

    return all_chunks


def main():
    parser = argparse.ArgumentParser(description="Re-ingest data into ChromaDB")
    parser.add_argument("--repos-only", action="store_true", help="Skip resume ingestion")
    parser.add_argument("--force-cards", action="store_true", help="Regenerate Repo Cards even if cached")
    args = parser.parse_args()

    # Validate required keys
    if not settings.gemini_api_key:
        logger.error("GEMINI_API_KEY not set")
        sys.exit(1)
    if not settings.voyage_api_key:
        logger.error("VOYAGE_API_KEY not set")
        sys.exit(1)
    if not settings.github_token:
        logger.error("GITHUB_TOKEN not set")
        sys.exit(1)

    # Clear and rebuild
    clear_collection()

    all_chunks = []

    # Resume
    if not args.repos_only:
        resume_chunks = run_resume_ingestion()
        all_chunks.extend(resume_chunks)
    else:
        logger.info("Skipping resume (--repos-only)")

    # Repos
    repo_chunks = run_repo_ingestion(force_cards=args.force_cards)
    all_chunks.extend(repo_chunks)

    # Ingest into ChromaDB
    logger.info(f"\nIngesting {len(all_chunks)} total chunks into ChromaDB...")
    count = ingest_chunks(
        settings.voyage_api_key,
        str(settings.chroma_dir),
        all_chunks,
    )
    logger.info(f"Done! {count} chunks in ChromaDB.")

    # Summary
    source_counts = {}
    for c in all_chunks:
        st = c["metadata"]["source_type"]
        source_counts[st] = source_counts.get(st, 0) + 1
    logger.info(f"Breakdown: {json.dumps(source_counts)}")


if __name__ == "__main__":
    main()
