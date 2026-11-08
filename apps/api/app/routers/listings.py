from typing import Annotated
from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.db import get_conn
from app.models.schemas import Category, ListingDetail
from app.services import listings

router = APIRouter(prefix="/api/listings", tags=["listings"])

Conn = Annotated[psycopg.Connection, Depends(get_conn)]


@router.get("", response_model=list[ListingDetail])
def browse_listings(
    conn: Conn,
    q: Annotated[str | None, Query(max_length=100)] = None,
    category: Category | None = None,
    price: Annotated[
        str | None, Query(description="'free', or a whole-dollar maximum (exclusive)")
    ] = None,
    include_unavailable: bool = False,
) -> list[ListingDetail]:
    free_only = price == "free"
    max_price_cents: int | None = None
    if price and not free_only:
        if not price.isdigit():
            raise HTTPException(
                400, "price must be 'free' or a whole number of dollars"
            )
        max_price_cents = int(price) * 100
    return listings.search_listings(
        conn,
        q=q.strip() if q else None,
        category=category,
        max_price_cents=max_price_cents,
        free_only=free_only,
        include_unavailable=include_unavailable,
    )


@router.get("/{listing_id}", response_model=ListingDetail)
def read_listing(listing_id: UUID, conn: Conn) -> ListingDetail:
    listing = listings.get_listing(conn, listing_id)
    if listing is None:
        raise HTTPException(404, "Listing not found")
    return listing
