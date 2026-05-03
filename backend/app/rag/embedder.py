"""Voyage AI embedding wrapper."""

import logging
import voyageai

logger = logging.getLogger(__name__)

_client: voyageai.Client | None = None


def get_client(api_key: str) -> voyageai.Client:
    global _client
    if _client is None:
        _client = voyageai.Client(api_key=api_key)
    return _client


def embed_texts(api_key: str, texts: list[str], input_type: str = "document") -> list[list[float]]:
    """Embed a batch of texts using Voyage AI.

    input_type: 'document' for ingestion, 'query' for retrieval queries.
    """
    client = get_client(api_key)

    # Voyage has batch size limits; chunk into batches of 128
    all_embeddings = []
    batch_size = 128
    model = "voyage-3-large"

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        try:
            result = client.embed(batch, model=model, input_type=input_type)
            all_embeddings.extend(result.embeddings)
        except Exception as e:
            if "voyage-3-large" in str(e):
                logger.warning("voyage-3-large not available, falling back to voyage-3")
                model = "voyage-3"
                result = client.embed(batch, model=model, input_type=input_type)
                all_embeddings.extend(result.embeddings)
            else:
                raise

    return all_embeddings
