"""Match a need (free text + constraints) to real, available listings.

1. Hard filters in SQL: available, category, budget, free on the requested
   dates, not the requester's own listing. Semantic similarity never overrides these.
2. Rank with PostgreSQL full-text search, or optionally Gemini embeddings.
   The result says which.
3. Reasons are built from the listing's real attributes only.
"""

import logging
import re
from dataclasses import dataclass
from datetime import date
from typing import Any
from uuid import UUID

import psycopg

from app.core.config import get_settings
from app.models.schemas import ListingDetail, Match, MatchResult
from app.services import embeddings, relevance
from app.services.listings import LISTING_DETAIL_SELECT, listing_from_row

logger = logging.getLogger(__name__)

MAX_MATCHES = 6
CATEGORY_NAMES = {
    "electronics": "Electronics",
    "cameras": "Cameras",
    "textbooks": "Textbooks",
    "outdoor": "Outdoor & Camping",
    "music": "Music",
    "kitchen": "Kitchen",
    "tools": "Tools & DIY",
    "sports": "Sports",
}
STOPWORDS = {
    "the", "and", "for", "with", "need", "needs", "want", "looking", "someone", "anyone",
    "borrow", "rent", "have", "has", "can", "could", "would", "please", "thanks", "some",
    "next", "week", "weekend", "days", "day", "this", "that", "from", "just", "like", "any",
    "will", "your", "you", "our", "get", "trip", "use",
}  # fmt: skip


@dataclass(frozen=True)
class Need:
    text: str
    category: str | None = None
    budget_per_day_cents: int | None = None
    start_date: date | None = None
    end_date: date | None = None
    exclude_owner_id: UUID | None = None


def _filters(need: Need) -> tuple[str, list[Any]]:
    clauses = ["l.availability_status = 'available'"]
    params: list[Any] = []
    if need.category:
        clauses.append("l.category = %s")
        params.append(need.category)
    if need.budget_per_day_cents is not None:
        clauses.append("coalesce(l.price_per_day_cents, 0) <= %s")
        params.append(need.budget_per_day_cents)
    if need.exclude_owner_id:
        clauses.append("l.owner_id <> %s")
        params.append(need.exclude_owner_id)
    if need.start_date and need.end_date:
        clauses.append(
            "not exists (select 1 from rental_requests b where b.listing_id = l.id"
            " and b.status in ('accepted', 'active')"
            " and daterange(b.start_date, b.end_date, '[]') && daterange(%s, %s, '[]'))"
        )
        params.extend([need.start_date, need.end_date])
    return " and ".join(clauses), params


def _dollars(cents: int) -> str:
    return f"${cents // 100}" if cents % 100 == 0 else f"${cents / 100:.2f}"


def build_reason(listing: ListingDetail, need: Need, lead: str) -> str:
    parts = [lead, CATEGORY_NAMES[listing.category]]
    price = listing.price_per_day_cents
    if price is None:
        parts.append("free to borrow")
    elif need.budget_per_day_cents is not None:
        parts.append(
            f"{_dollars(price)}/day, within your {_dollars(need.budget_per_day_cents)}/day budget"
        )
    else:
        parts.append(f"{_dollars(price)}/day")
    if need.start_date and need.end_date:
        parts.append("free on your dates")
    parts.append(f"pickup at {listing.location}")
    return " · ".join(parts)


def tokens(text: str) -> list[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return list(dict.fromkeys(w for w in words if len(w) >= 3 and w not in STOPWORDS))


def close_enough(
    similarity: dict[UUID, float], floor: float, max_gap: float
) -> set[UUID]:
    """IDs worth showing: above an absolute floor and near the best match.

    With Gemini embeddings, unrelated listings still score around 0.52-0.58,
    so the floor alone lets noise through; the gap drops anything far behind
    the best match for this query. A need with no good match returns nothing.
    """
    if not similarity:
        return set()
    best = max(similarity.values())
    return {
        listing_id
        for listing_id, score in similarity.items()
        if score >= floor and best - score <= max_gap
    }


def _vector_matches(conn: psycopg.Connection, need: Need) -> list[Match]:
    [query_vector] = embeddings.embed_texts([need.text], "RETRIEVAL_QUERY")
    where, params = _filters(need)
    vector = embeddings.to_pgvector(query_vector)
    rows = conn.execute(
        f"select * from ({LISTING_DETAIL_SELECT}"
        f" where {where} and l.embedding is not null"
        " order by l.embedding <=> %s::vector limit %s) ranked",
        [*params, vector, MAX_MATCHES * 2],
    ).fetchall()
    # Similarity is computed separately so the ORDER BY above can use the index.
    similarity = _similarities(conn, vector, [row["id"] for row in rows])
    settings = get_settings()
    keep = close_enough(
        similarity, settings.match_min_similarity, settings.match_max_gap_from_best
    )
    matches = []
    for row in rows:
        if row["id"] not in keep:
            continue
        score = similarity[row["id"]]
        listing = listing_from_row(row)
        matches.append(
            Match(
                listing=listing,
                score=round(score, 3),
                reason=build_reason(listing, need, "Close to what you described"),
            )
        )
    matches.sort(key=lambda m: m.score, reverse=True)
    return _drop_irrelevant(need, matches[:MAX_MATCHES])


def _drop_irrelevant(need: Need, shortlist: list[Match]) -> list[Match]:
    """Ask Gemini which shortlisted listings really meet the need. It can only
    remove candidates; if the check fails, the similarity cut-off result stands."""
    if not shortlist or not relevance.is_enabled():
        return shortlist
    try:
        fitting = relevance.fitting_indices(need.text, [m.listing for m in shortlist])
    except relevance.RelevanceError as error:
        logger.warning("Relevance check skipped: %s", error)
        return shortlist
    return [match for index, match in enumerate(shortlist) if index in fitting]


def _similarities(
    conn: psycopg.Connection, vector: str, ids: list[UUID]
) -> dict[UUID, float]:
    if not ids:
        return {}
    rows = conn.execute(
        "select id, 1 - (embedding <=> %s::vector) as similarity from listings where id = any(%s)",
        (vector, ids),
    ).fetchall()
    return {row["id"]: float(row["similarity"]) for row in rows}


def _fulltext_matches(conn: psycopg.Connection, need: Need) -> list[Match]:
    words = tokens(need.text)
    if not words:
        return []
    where, params = _filters(need)
    document = (
        "setweight(to_tsvector('english', coalesce(l.title, '')), 'A') || "
        "setweight(to_tsvector('english', coalesce(l.description, '')), 'B')"
    )
    query = " OR ".join(words)
    rows = conn.execute(
        f"select ranked.*, ts_rank_cd(({document}), websearch_to_tsquery('english', %s), 32) as search_rank "
        f"from listings l join profiles o on o.id = l.owner_id "
        f"join ({LISTING_DETAIL_SELECT} where {where}) ranked on ranked.id = l.id "
        f"where ({document}) @@ websearch_to_tsquery('english', %s) "
        "order by search_rank desc, l.created_at desc limit %s",
        [query, *params, query, MAX_MATCHES],
    ).fetchall()
    return [
        Match(
            listing=listing_from_row(row),
            score=round(float(row["search_rank"]), 3),
            reason=build_reason(listing_from_row(row), need, "Matches your search"),
        )
        for row in rows
    ]


def find_matches(conn: psycopg.Connection, need: Need) -> MatchResult:
    if embeddings.is_configured():
        try:
            return MatchResult(method="vector", matches=_vector_matches(conn, need))
        except embeddings.EmbeddingError as error:
            logger.warning("Falling back to full-text matching: %s", error)
    return MatchResult(method="fulltext", matches=_fulltext_matches(conn, need))
