from typing import Annotated
from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import Field

from app.core.auth import CurrentProfile
from app.core.db import get_conn
from app.models.schemas import CamelModel, Category, Condition, ListingDetail
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


class ListingCreate(CamelModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(max_length=2000)
    category: Category
    condition: Condition
    price_per_day_cents: int | None = Field(default=None, ge=0, le=100_000)
    deposit_cents: int | None = Field(default=None, ge=0, le=1_000_000)
    location: str = Field(min_length=1, max_length=80)


@router.post("", response_model=ListingDetail, status_code=201)
def create_listing(
    body: ListingCreate, me: CurrentProfile, conn: Conn
) -> ListingDetail:
    return listings.create_listing(
        conn,
        owner_id=me.id,
        title=body.title.strip(),
        description=body.description.strip(),
        category=body.category,
        condition=body.condition,
        price_per_day_cents=body.price_per_day_cents,
        deposit_cents=body.deposit_cents,
        location=body.location.strip(),
    )
