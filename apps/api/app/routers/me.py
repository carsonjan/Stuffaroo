from typing import Annotated

import psycopg
from fastapi import APIRouter, Depends

from app.core.auth import CurrentProfile
from app.core.db import get_conn
from app.models.schemas import ListingDetail, Profile, WantedPost
from app.services import listings, wanted

router = APIRouter(prefix="/api/me", tags=["me"])

Conn = Annotated[psycopg.Connection, Depends(get_conn)]


@router.get("", response_model=Profile)
def read_me(me: CurrentProfile) -> Profile:
    return me


@router.get("/listings", response_model=list[ListingDetail])
def my_listings(me: CurrentProfile, conn: Conn) -> list[ListingDetail]:
    return listings.search_listings(conn, owner_id=me.id, include_unavailable=True)


@router.get("/wanted", response_model=list[WantedPost])
def my_wanted(me: CurrentProfile, conn: Conn) -> list[WantedPost]:
    return wanted.list_for_user(conn, me.id)
