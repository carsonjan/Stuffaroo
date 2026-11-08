from datetime import date
from typing import Annotated, Self
from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field, model_validator

from app.core.auth import CurrentProfile
from app.core.db import get_conn
from app.models.schemas import CamelModel, Category, MatchResult, WantedPost
from app.services import matching, wanted

router = APIRouter(tags=["wanted"])

Conn = Annotated[psycopg.Connection, Depends(get_conn)]


@router.get("/api/wanted", response_model=list[WantedPost])
def list_wanted(conn: Conn) -> list[WantedPost]:
    return wanted.list_open(conn)


@router.get("/api/wanted/{wanted_id}", response_model=WantedPost)
def read_wanted(wanted_id: UUID, conn: Conn) -> WantedPost:
    post = wanted.get_wanted(conn, wanted_id)
    if post is None:
        raise HTTPException(404, "Wanted post not found")
    return post


@router.get("/api/wanted/{wanted_id}/matches", response_model=MatchResult)
def wanted_matches(wanted_id: UUID, conn: Conn) -> MatchResult:
    post = wanted.get_wanted(conn, wanted_id)
    if post is None:
        raise HTTPException(404, "Wanted post not found")
    return matching.find_matches(
        conn,
        matching.Need(
            text=f"{post.title}\n{post.description}",
            category=post.category,
            budget_per_day_cents=post.budget_per_day_cents,
            start_date=post.start_date,
            end_date=post.end_date,
            exclude_owner_id=post.user_id,
        ),
    )


class MatchQuery(CamelModel):
    text: str = Field(min_length=3, max_length=1000)
    category: Category | None = None
    budget_per_day_cents: int | None = Field(default=None, ge=0)
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="after")
    def check_dates(self) -> Self:
        if (self.start_date is None) != (self.end_date is None):
            raise ValueError("Give both startDate and endDate, or neither")
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("endDate must be on or after startDate")
        return self


@router.post("/api/matches", response_model=MatchResult)
def match_need(query: MatchQuery, conn: Conn) -> MatchResult:
    return matching.find_matches(
        conn,
        matching.Need(
            text=query.text,
            category=query.category,
            budget_per_day_cents=query.budget_per_day_cents,
            start_date=query.start_date,
            end_date=query.end_date,
        ),
    )


class WantedCreate(CamelModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(max_length=2000)
    category: Category
    budget_per_day_cents: int | None = Field(default=None, ge=0, le=100_000)
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def check_dates(self) -> Self:
        if self.end_date < self.start_date:
            raise ValueError("endDate must be on or after startDate")
        return self


@router.post("/api/wanted", response_model=WantedPost, status_code=201)
def create_wanted(body: WantedCreate, me: CurrentProfile, conn: Conn) -> WantedPost:
    return wanted.create_wanted(
        conn,
        user_id=me.id,
        title=body.title.strip(),
        description=body.description.strip(),
        category=body.category,
        budget_per_day_cents=body.budget_per_day_cents,
        start_date=body.start_date,
        end_date=body.end_date,
    )
