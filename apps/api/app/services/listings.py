import logging
from typing import Any
from uuid import UUID

import psycopg

from app.models.schemas import ListingDetail
from app.services import embeddings
from app.services.profiles import profile_columns, profile_from_row

logger = logging.getLogger(__name__)

LISTING_DETAIL_SELECT = f"""
select l.id, l.owner_id, l.title, l.description, l.category, l.condition,
       l.price_per_day_cents, l.deposit_cents, l.location, l.availability_status,
       l.created_at, {profile_columns("o", "owner")}
from listings l join profiles o on o.id = l.owner_id
"""


def listing_from_row(row: dict[str, Any]) -> ListingDetail:
    return ListingDetail(
        id=row["id"],
        owner_id=row["owner_id"],
        title=row["title"],
        description=row["description"],
        category=row["category"],
        condition=row["condition"],
        price_per_day_cents=row["price_per_day_cents"],
        deposit_cents=row["deposit_cents"],
        location=row["location"],
        availability=row["availability_status"],
        created_at=row["created_at"],
        owner=profile_from_row(row, "owner"),
    )


def search_listings(
    conn: psycopg.Connection,
    *,
    q: str | None = None,
    category: str | None = None,
    max_price_cents: int | None = None,
    free_only: bool = False,
    include_unavailable: bool = False,
    owner_id: UUID | None = None,
    limit: int = 100,
) -> list[ListingDetail]:
    clauses: list[str] = []
    params: list[Any] = []
    if q:
        clauses.append("(l.title || ' ' || l.description) ilike %s")
        params.append(f"%{q}%")
    if category:
        clauses.append("l.category = %s")
        params.append(category)
    if free_only:
        clauses.append("l.price_per_day_cents is null")
    elif max_price_cents is not None:
        clauses.append("coalesce(l.price_per_day_cents, 0) < %s")
        params.append(max_price_cents)
    if not include_unavailable:
        clauses.append("l.availability_status = 'available'")
    if owner_id:
        clauses.append("l.owner_id = %s")
        params.append(owner_id)
    where = f"where {' and '.join(clauses)}" if clauses else ""
    rows = conn.execute(
        f"{LISTING_DETAIL_SELECT} {where} order by l.created_at desc limit %s",
        [*params, limit],
    ).fetchall()
    return [listing_from_row(row) for row in rows]


def get_listing(conn: psycopg.Connection, listing_id: UUID) -> ListingDetail | None:
    row = conn.execute(
        f"{LISTING_DETAIL_SELECT} where l.id = %s", (listing_id,)
    ).fetchone()
    return listing_from_row(row) if row else None


def create_listing(
    conn: psycopg.Connection,
    *,
    owner_id: UUID,
    title: str,
    description: str,
    category: str,
    condition: str,
    price_per_day_cents: int | None,
    deposit_cents: int | None,
    location: str,
) -> ListingDetail:
    row = conn.execute(
        "insert into listings (owner_id, title, description, category, condition,"
        " price_per_day_cents, deposit_cents, location)"
        " values (%s, %s, %s, %s, %s, %s, %s, %s) returning id",
        (
            owner_id,
            title,
            description,
            category,
            condition,
            price_per_day_cents,
            deposit_cents,
            location,
        ),
    ).fetchone()
    embed_listing(conn, row["id"], title, category, description)
    listing = get_listing(conn, row["id"])
    assert listing is not None
    return listing


def embed_listing(
    conn: psycopg.Connection,
    listing_id: UUID,
    title: str,
    category: str,
    description: str,
) -> bool:
    """Best effort: a listing without an embedding still saves and matches by keyword."""
    if not embeddings.is_configured():
        return False
    try:
        [vector] = embeddings.embed_texts(
            [embeddings.listing_document(title, category, description)],
            "RETRIEVAL_DOCUMENT",
        )
    except embeddings.EmbeddingError as error:
        logger.warning("Listing %s saved without an embedding: %s", listing_id, error)
        return False
    conn.execute(
        "update listings set embedding = %s::vector where id = %s",
        (embeddings.to_pgvector(vector), listing_id),
    )
    return True
