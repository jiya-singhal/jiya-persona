"""ChromaDB retrieval with metadata filtering and MMR diversity."""

import logging
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.rag.embedder import embed_texts

logger = logging.getLogger(__name__)

COLLECTION_NAME = "jiya_persona"


def get_chroma_client(persist_dir: str) -> chromadb.ClientAPI:
    return chromadb.PersistentClient(
        path=persist_dir,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def get_or_create_collection(client: chromadb.ClientAPI) -> chromadb.Collection:
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def ingest_chunks(
    voyage_api_key: str,
    chroma_dir: str,
    chunks: list[dict],
) -> int:
    """Ingest chunks into ChromaDB. Returns number of chunks added."""
    if not chunks:
        return 0

    client = get_chroma_client(chroma_dir)
    collection = get_or_create_collection(client)

    texts = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    ids = [f"{c['metadata'].get('source_type', 'unk')}_{i}" for i, c in enumerate(chunks)]

    # Embed
    embeddings = embed_texts(voyage_api_key, texts, input_type="document")

    # Upsert in batches
    batch_size = 500
    total = 0
    for i in range(0, len(texts), batch_size):
        end = min(i + batch_size, len(texts))
        collection.upsert(
            ids=ids[i:end],
            documents=texts[i:end],
            metadatas=metadatas[i:end],
            embeddings=embeddings[i:end],
        )
        total += end - i

    logger.info(f"Ingested {total} chunks into ChromaDB")
    return total


def query(
    voyage_api_key: str,
    chroma_dir: str,
    query_text: str,
    source_filter: str = "any",
    k: int = 12,
    top_k_after_mmr: int = 6,
) -> list[dict]:
    """Query ChromaDB with optional metadata filtering and MMR diversity."""
    client = get_chroma_client(chroma_dir)
    collection = get_or_create_collection(client)

    query_embedding = embed_texts(voyage_api_key, [query_text], input_type="query")[0]

    where_filter = None
    if source_filter == "resume":
        # The curated work notes are the private-repo work the resume
        # summarises, so employer questions draw on both.
        where_filter = {"source_type": {"$in": ["resume", "work_story"]}}
    elif source_filter == "github":
        # Public-project questions: repo cards and code, plus the curated
        # notes on personal projects (they carry the corrected numbers and
        # the branch caveats a repo summary generated from `main` misses).
        where_filter = {
            "$or": [
                {"source_type": {"$in": ["github_card", "github_code"]}},
                {"company": "personal project"},
            ]
        }

    kwargs = {
        "query_embeddings": [query_embedding],
        "n_results": k,
        "include": ["documents", "metadatas", "distances"],
    }
    if where_filter:
        kwargs["where"] = where_filter

    results = collection.query(**kwargs)

    if not results["documents"] or not results["documents"][0]:
        return []

    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0]

    # Build result list
    items = []
    for doc, meta, dist in zip(docs, metas, distances):
        items.append({
            "text": doc,
            "metadata": meta,
            "score": 1 - dist,  # cosine distance → similarity
        })

    # Simple MMR-style diversity: don't return >2 chunks from the same repo for broad queries
    return _mmr_diversify(items, top_k_after_mmr)


MAX_PER_REPO = 2
MAX_PER_STORY = 2
MAX_RESUME = 4


def _diversity_key(meta: dict) -> tuple[str, int]:
    """Group key and cap for the diversity pass.

    Code and card chunks from one repo are near-duplicates of each other, so
    they are capped per repo. Work notes are capped per note (topic). Resume
    chunks are the densest facts in the corpus and get a higher cap; the old
    behaviour keyed them all under one "resume" bucket capped at 2, which let
    raw code crowd out the resume on most unfiltered questions.
    """
    source = meta.get("source_type", "")
    if source == "resume":
        return ("resume", MAX_RESUME)
    if source == "work_story":
        topic = meta.get("topic", "")
        # The overview note mentions everything, so it matches everything;
        # one of its sections is enough context on any question.
        cap = 1 if topic == "overview" else MAX_PER_STORY
        return (f"story:{topic}", cap)
    repo = meta.get("repo", "")
    return (repo or source, MAX_PER_REPO)


def _mmr_diversify(items: list[dict], top_k: int) -> list[dict]:
    """Simple diversity pass: limit per-repo / per-note representation."""
    repo_counts: dict[str, int] = {}
    selected = []

    for item in items:
        key, cap = _diversity_key(item["metadata"])

        if repo_counts.get(key, 0) >= cap and len(selected) < top_k:
            continue

        selected.append(item)
        repo_counts[key] = repo_counts.get(key, 0) + 1

        if len(selected) >= top_k:
            break

    # If we don't have enough, fill from remaining
    if len(selected) < top_k:
        for item in items:
            if item not in selected:
                selected.append(item)
                if len(selected) >= top_k:
                    break

    return selected
