from typing import Any
from uuid import UUID

import psycopg

from app.models.schemas import WantedPost
from app.services.profiles import profile_columns, profile_from_row

WANTED_SELECT = f"""
select w.id, w.user_id, w.title, w.description, w.category, w.budget_per_day_cents,
       w.start_date, w.end_date, w.status, w.created_at, {profile_columns("a", "author")}
from wanted_posts w join profiles a on a.id = w.user_id
"""


def wanted_from_row(row: dict[str, Any]) -> WantedPost:
    return WantedPost(
        id=row["id"],
        user_id=row["user_id"],
        title=row["title"],
        description=row["description"],
        category=row["category"],
        budget_per_day_cents=row["budget_per_day_cents"],
        start_date=row["start_date"],
        end_date=row["end_date"],
        status=row["status"],
        created_at=row["created_at"],
        author=profile_from_row(row, "author"),
    )


def list_open(conn: psycopg.Connection, limit: int = 100) -> list[WantedPost]:
    rows = conn.execute(
        f"{WANTED_SELECT} where w.status = 'open' order by w.created_at desc limit %s",
        (limit,),
    ).fetchall()
    return [wanted_from_row(row) for row in rows]


def list_for_user(conn: psycopg.Connection, user_id: UUID) -> list[WantedPost]:
    rows = conn.execute(
        f"{WANTED_SELECT} where w.user_id = %s order by w.created_at desc", (user_id,)
    ).fetchall()
    return [wanted_from_row(row) for row in rows]


def get_wanted(conn: psycopg.Connection, wanted_id: UUID) -> WantedPost | None:
    row = conn.execute(f"{WANTED_SELECT} where w.id = %s", (wanted_id,)).fetchone()
    return wanted_from_row(row) if row else None
