from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

Category = Literal[
    "electronics",
    "cameras",
    "textbooks",
    "outdoor",
    "music",
    "kitchen",
    "tools",
    "sports",
]
Condition = Literal["New", "Like new", "Good", "Fair"]
Availability = Literal["available", "on_loan", "paused"]
WantedStatus = Literal["open", "fulfilled", "closed"]
RentalStatus = Literal[
    "pending", "accepted", "rejected", "cancelled", "active", "completed"
]


class CamelModel(BaseModel):
    """JSON uses camelCase; Python uses snake_case."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Profile(CamelModel):
    id: UUID
    display_name: str
    campus: str | None
    program: str | None
    initials: str
    joined_at: datetime
    completed_lends: int


class Listing(CamelModel):
    id: UUID
    owner_id: UUID
    title: str
    description: str
    category: Category
    condition: Condition
    price_per_day_cents: int | None
    deposit_cents: int | None
    location: str
    availability: Availability
    created_at: datetime


class ListingDetail(Listing):
    owner: Profile


class ProfileWithListings(CamelModel):
    profile: Profile
    listings: list[ListingDetail]


class WantedPost(CamelModel):
    id: UUID
    user_id: UUID
    title: str
    description: str
    category: Category
    budget_per_day_cents: int | None
    start_date: date
    end_date: date
    status: WantedStatus
    created_at: datetime
    author: Profile


class Match(CamelModel):
    listing: ListingDetail
    score: float
    reason: str


class MatchResult(CamelModel):
    method: Literal["vector", "fulltext"]
    matches: list[Match]


class RentalRequest(CamelModel):
    id: UUID
    listing_id: UUID
    borrower_id: UUID
    start_date: date
    end_date: date
    status: RentalStatus
    message: str
    created_at: datetime
    updated_at: datetime
    listing: ListingDetail
    borrower: Profile
