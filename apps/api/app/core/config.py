from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

API_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=API_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        # `DATABASE_URL=` (blank, as in .env.example) means "use the default".
        env_ignore_empty=True,
    )

    # Tiger Cloud (or any Postgres with pgvector + pgvectorscale). The default
    # points at the local Docker container described in the README.
    database_url: str = "postgresql://postgres:stuffaroo@localhost:5433/stuffaroo"

    database_direct_url: str | None = None

    # Auth0: both must be set for protected endpoints to work.
    auth0_domain: str | None = None
    auth0_audience: str | None = None

    enable_gemini: bool = False

    # Gemini, either through Vertex AI on a Google Cloud project (uses
    # Application Default Credentials and the project's billing/credits) or with
    # an AI Studio API key. With neither, matching falls back to keyword ranking.
    google_genai_use_vertexai: bool = False
    google_cloud_project: str | None = None
    google_cloud_location: str = "us-central1"
    # Service-account key file for Vertex AI, relative to apps/api. Lets any
    # machine (and the Docker image) use the project without a personal
    # Google login. Without it, Vertex AI uses Application Default Credentials.
    google_application_credentials: str | None = None
    gemini_api_key: str | None = None
    gemini_embedding_model: str = "gemini-embedding-001"
    gemini_timeout_seconds: float = 10.0
    # Vector matches are kept only above this cosine similarity and within
    # match_max_gap_from_best of the best match for the query. Tuned on real
    # gemini-embedding-001 scores: good matches ~0.59-0.68, unrelated ~0.52-0.58.
    match_min_similarity: float = 0.58
    match_max_gap_from_best: float = 0.07
    # A Gemini text model double-checks the vector shortlist and drops listings
    # that don't actually meet the need. On Vertex AI, current text models are
    # served from the "global" location (embeddings use google_cloud_location).
    match_relevance_check: bool = True
    # flash-lite was faster (~2s per search) but dropped good matches;
    # flash (~3s) kept every fitting item across repeated runs.
    gemini_relevance_model: str = "gemini-3.5-flash"
    gemini_relevance_location: str = "global"

    cors_origins: list[str] = ["http://localhost:3000"]


EMBEDDING_DIMENSIONS = 768


@lru_cache
def get_settings() -> Settings:
    return Settings()
