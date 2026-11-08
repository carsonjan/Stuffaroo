from typing import Any
from uuid import UUID

import psycopg

from app.models.schemas import Profile


def initials_for(name: str) -> str:
    parts = [part for part in name.split() if part]
    letters = (parts[0][0] + parts[-1][0]) if len(parts) > 1 else name[:2]
    return letters.upper()


def profile_columns(alias: str, prefix: str) -> str:
    """SELECT fragment for a profile joined as `alias`, with columns named `<prefix>_*`."""
    return (
        f"{alias}.id as {prefix}_id, {alias}.display_name as {prefix}_display_name, "
        f"{alias}.campus as {prefix}_campus, {alias}.program as {prefix}_program, "
        f"{alias}.created_at as {prefix}_created_at, "
        f"(select count(*) from rental_requests rr join listings ll on ll.id = rr.listing_id"
        f" where ll.owner_id = {alias}.id and rr.status = 'completed') as {prefix}_completed_lends"
    )


def profile_from_row(row: dict[str, Any], prefix: str) -> Profile:
    name = row[f"{prefix}_display_name"]
    return Profile(
        id=row[f"{prefix}_id"],
        display_name=name,
        campus=row[f"{prefix}_campus"],
        program=row[f"{prefix}_program"],
        initials=initials_for(name),
        joined_at=row[f"{prefix}_created_at"],
        completed_lends=row[f"{prefix}_completed_lends"],
    )


def get_profile(conn: psycopg.Connection, profile_id: UUID) -> Profile | None:
    row = conn.execute(
        f"select {profile_columns('p', 'p')} from profiles p where p.id = %s",
        (profile_id,),
    ).fetchone()
    return profile_from_row(row, "p") if row else None
