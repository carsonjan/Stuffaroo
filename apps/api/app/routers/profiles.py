from typing import Annotated
from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException

from app.core.db import get_conn
from app.models.schemas import ProfileWithListings
from app.services import listings, profiles

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


@router.get("/{profile_id}", response_model=ProfileWithListings)
def read_profile(
    profile_id: UUID, conn: Annotated[psycopg.Connection, Depends(get_conn)]
) -> ProfileWithListings:
    profile = profiles.get_profile(conn, profile_id)
    if profile is None:
        raise HTTPException(404, "Profile not found")
    return ProfileWithListings(
        profile=profile,
        listings=listings.search_listings(
            conn, owner_id=profile_id, include_unavailable=True
        ),
    )
