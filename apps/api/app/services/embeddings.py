"""Gemini text embeddings for listings and needs.

Listings are embedded as RETRIEVAL_DOCUMENT and needs as RETRIEVAL_QUERY, both
at EMBEDDING_DIMENSIONS so they fit the `vector(768)` column and DiskANN index.
"""

import math
from typing import Literal

from google import genai
from google.genai import types

from app.core.config import EMBEDDING_DIMENSIONS, get_settings

TaskType = Literal["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"]


class EmbeddingError(RuntimeError):
    """Gemini was configured but the call failed or returned something unusable."""


def is_configured() -> bool:
    return bool(get_settings().gemini_api_key)


def _normalize(values: list[float]) -> list[float]:
    # Gemini recommends normalizing truncated (non-3072) embeddings.
    norm = math.sqrt(sum(v * v for v in values))
    if norm == 0:
        raise EmbeddingError("Gemini returned an all-zero embedding")
    return [v / norm for v in values]


def embed_texts(texts: list[str], task_type: TaskType) -> list[list[float]]:
    """Embed texts with Gemini. Raises EmbeddingError on any failure."""
    settings = get_settings()
    if not settings.gemini_api_key:
        raise EmbeddingError("GEMINI_API_KEY is not set")
    if not texts:
        return []
    client = genai.Client(
        api_key=settings.gemini_api_key,
        http_options=types.HttpOptions(
            timeout=int(settings.gemini_timeout_seconds * 1000)
        ),
    )
    try:
        response = client.models.embed_content(
            model=settings.gemini_embedding_model,
            contents=texts,
            config=types.EmbedContentConfig(
                task_type=task_type, output_dimensionality=EMBEDDING_DIMENSIONS
            ),
        )
    # The SDK raises several error types; all of them mean "no embedding".
    except Exception as error:
        raise EmbeddingError(f"Gemini embedding request failed: {error}") from error

    embeddings = response.embeddings or []
    if len(embeddings) != len(texts):
        raise EmbeddingError(
            "Gemini returned a different number of embeddings than requested"
        )
    vectors: list[list[float]] = []
    for embedding in embeddings:
        values = list(embedding.values or [])
        if len(values) != EMBEDDING_DIMENSIONS:
            raise EmbeddingError(
                f"Expected {EMBEDDING_DIMENSIONS} dimensions, got {len(values)}"
            )
        vectors.append(_normalize(values))
    return vectors


def listing_document(title: str, category: str, description: str) -> str:
    return f"{title}\nCategory: {category}\n{description}"


def to_pgvector(values: list[float]) -> str:
    return "[" + ",".join(f"{v:.7f}" for v in values) + "]"
