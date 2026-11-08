from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

API_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=API_ROOT / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Tiger Cloud (or any Postgres with pgvector + pgvectorscale). The default
    # points at the local Docker container described in the README.
    database_url: str = "postgresql://postgres:stuffaroo@localhost:5433/stuffaroo"

    # Auth0: both must be set for protected endpoints to work.
    auth0_domain: str | None = None
    auth0_audience: str | None = None

    # Gemini: without a key, matching falls back to keyword ranking.
    gemini_api_key: str | None = None
    gemini_embedding_model: str = "gemini-embedding-001"
    gemini_timeout_seconds: float = 10.0
    # Vector matches below this cosine similarity are dropped as unrelated.
    match_min_similarity: float = 0.55

    cors_origins: list[str] = ["http://localhost:3000"]


EMBEDDING_DIMENSIONS = 768


@lru_cache
def get_settings() -> Settings:
    return Settings()
