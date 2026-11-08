"""Gemini text embeddings for listings and needs.

Listings are embedded as RETRIEVAL_DOCUMENT and needs as RETRIEVAL_QUERY, both
at EMBEDDING_DIMENSIONS so they fit the `vector(768)` column and DiskANN index.

Runs through Vertex AI on a Google Cloud project (GOOGLE_GENAI_USE_VERTEXAI=true,
GOOGLE_CLOUD_PROJECT, Application Default Credentials) or with an AI Studio key
(GEMINI_API_KEY). Vertex AI wins when both are set.
"""

import math
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

from google import genai
from google.genai import types

from app.core.config import API_ROOT, EMBEDDING_DIMENSIONS, Settings, get_settings

TaskType = Literal["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"]


class EmbeddingError(RuntimeError):
    """Gemini was configured but the call failed or returned something unusable."""


def client_options(settings: Settings) -> dict[str, Any] | None:
    """genai.Client arguments for the configured backend, or None if neither is set."""
    if settings.google_genai_use_vertexai and settings.google_cloud_project:
        return {
            "vertexai": True,
            "project": settings.google_cloud_project,
            "location": settings.google_cloud_location,
        }
    if settings.gemini_api_key:
        return {"api_key": settings.gemini_api_key}
    return None


def credentials_path(settings: Settings) -> Path | None:
    """The service-account key file, resolved against apps/api, if one is set."""
    if not settings.google_application_credentials:
        return None
    path = Path(settings.google_application_credentials)
    return path if path.is_absolute() else API_ROOT / path


@lru_cache
def _service_account_credentials(path: Path) -> Any:
    from google.oauth2 import service_account

    return service_account.Credentials.from_service_account_file(
        str(path), scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )


def make_client(settings: Settings, location: str | None = None) -> genai.Client:
    """A Gemini client for the configured backend. Raises EmbeddingError if
    Gemini isn't configured or the service-account key can't be read."""
    options = client_options(settings)
    if options is None:
        raise EmbeddingError("Gemini is not configured (Vertex AI or GEMINI_API_KEY)")
    if options.get("vertexai"):
        if location:
            options["location"] = location
        path = credentials_path(settings)
        if path is not None:
            try:
                options["credentials"] = _service_account_credentials(path)
            except (OSError, ValueError) as error:
                raise EmbeddingError(
                    f"Can't read the service-account key at {path}: {error}"
                ) from error
    try:
        return genai.Client(
            **options,
            http_options=types.HttpOptions(
                timeout=int(settings.gemini_timeout_seconds * 1000)
            ),
        )
    # Resolving Google credentials raises several error types (for example no
    # Application Default Credentials); all mean "no client".
    except Exception as error:
        raise EmbeddingError(f"Can't create the Gemini client: {error}") from error


def is_configured() -> bool:
    return client_options(get_settings()) is not None


def _normalize(values: list[float]) -> list[float]:
    # Gemini recommends normalizing truncated (non-3072) embeddings.
    norm = math.sqrt(sum(v * v for v in values))
    if norm == 0:
        raise EmbeddingError("Gemini returned an all-zero embedding")
    return [v / norm for v in values]


def embed_texts(texts: list[str], task_type: TaskType) -> list[list[float]]:
    """Embed texts with Gemini. Raises EmbeddingError on any failure."""
    settings = get_settings()
    if not texts:
        return []
    client = make_client(settings)
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
