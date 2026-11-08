"""Embed every listing that has no embedding yet.

Run with `uv run python -m app.embed_listings` (or `pnpm db:embed`) after
seeding, once Gemini is configured (Vertex AI or GEMINI_API_KEY). New listings
created through the API are embedded when they are created.
"""

import psycopg

from app.core.config import get_settings
from app.services import embeddings

BATCH_SIZE = 50


def embed_missing(conn: psycopg.Connection) -> int:
    done = 0
    while True:
        rows = conn.execute(
            "select id, title, category, description from listings"
            " where embedding is null order by created_at limit %s",
            (BATCH_SIZE,),
        ).fetchall()
        if not rows:
            return done
        vectors = embeddings.embed_texts(
            [embeddings.listing_document(r[1], r[2], r[3]) for r in rows],
            "RETRIEVAL_DOCUMENT",
        )
        for row, vector in zip(rows, vectors, strict=True):
            conn.execute(
                "update listings set embedding = %s::vector where id = %s",
                (embeddings.to_pgvector(vector), row[0]),
            )
        conn.commit()
        done += len(rows)


def main() -> None:
    if not embeddings.is_configured():
        raise SystemExit(
            "Gemini is not configured (set GOOGLE_GENAI_USE_VERTEXAI + GOOGLE_CLOUD_PROJECT,"
            " or GEMINI_API_KEY); nothing embedded."
        )
    with psycopg.connect(get_settings().database_url) as conn:
        count = embed_missing(conn)
    print(f"Embedded {count} listings.")


if __name__ == "__main__":
    main()
