"""Rental requests and their state machine. All rules are enforced here and in
the database (the exclusion constraint blocks overlapping accepted/active bookings).
"""

from datetime import date
from typing import Any, Literal
from uuid import UUID

import psycopg
from psycopg import errors

from app.models.schemas import RentalRequest
from app.services.listings import listing_from_row
from app.services.profiles import profile_columns, profile_from_row

Action = Literal["accept", "reject", "cancel", "start", "complete"]
Role = Literal["owner", "borrower"]

# action -> (required current status, next status, who may do it)
TRANSITIONS: dict[str, tuple[str, str, Role]] = {
    "accept": ("pending", "accepted", "owner"),
    "reject": ("pending", "rejected", "owner"),
    "cancel": ("pending", "cancelled", "borrower"),
    "start": ("accepted", "active", "owner"),
    "complete": ("active", "completed", "owner"),
}

# Listing availability that follows a rental state change.
LISTING_AVAILABILITY_AFTER = {"active": "on_loan", "completed": "available"}


class RentalError(Exception):
    def __init__(self, status: int, detail: str) -> None:
        super().__init__(detail)
        self.status = status
        self.detail = detail


def next_status(action: Action, current: str, role: Role) -> str:
    """Pure rule check. Raises RentalError (403 wrong party, 409 wrong state)."""
    required, target, allowed_role = TRANSITIONS[action]
    if role != allowed_role:
        who = "the listing's owner" if allowed_role == "owner" else "the borrower"
        raise RentalError(403, f"Only {who} can {action} this request")
    if current != required:
        raise RentalError(409, f"Can't {action} a request that is {current}")
    return target


RENTAL_SELECT = f"""
select r.id as r_id, r.listing_id as r_listing_id, r.borrower_id as r_borrower_id,
       r.start_date as r_start_date, r.end_date as r_end_date, r.status as r_status,
       r.message as r_message, r.created_at as r_created_at, r.updated_at as r_updated_at,
       l.id, l.owner_id, l.title, l.description, l.category, l.condition,
       l.price_per_day_cents, l.deposit_cents, l.location, l.availability_status,
       l.created_at, {profile_columns("o", "owner")}, {profile_columns("b", "borrower")}
from rental_requests r
join listings l on l.id = r.listing_id
join profiles o on o.id = l.owner_id
join profiles b on b.id = r.borrower_id
"""


def rental_from_row(row: dict[str, Any]) -> RentalRequest:
    return RentalRequest(
        id=row["r_id"],
        listing_id=row["r_listing_id"],
        borrower_id=row["r_borrower_id"],
        start_date=row["r_start_date"],
        end_date=row["r_end_date"],
        status=row["r_status"],
        message=row["r_message"],
        created_at=row["r_created_at"],
        updated_at=row["r_updated_at"],
        listing=listing_from_row(row),
        borrower=profile_from_row(row, "borrower"),
    )


def get_rental(conn: psycopg.Connection, rental_id: UUID) -> RentalRequest | None:
    row = conn.execute(f"{RENTAL_SELECT} where r.id = %s", (rental_id,)).fetchone()
    return rental_from_row(row) if row else None


def list_rentals(
    conn: psycopg.Connection, profile_id: UUID, role: Role
) -> list[RentalRequest]:
    column = "l.owner_id" if role == "owner" else "r.borrower_id"
    rows = conn.execute(
        f"{RENTAL_SELECT} where {column} = %s order by r.created_at desc", (profile_id,)
    ).fetchall()
    return [rental_from_row(row) for row in rows]


def create_rental(
    conn: psycopg.Connection,
    *,
    borrower_id: UUID,
    listing_id: UUID,
    start_date: date,
    end_date: date,
    message: str,
) -> RentalRequest:
    listing = conn.execute(
        "select owner_id, availability_status from listings where id = %s",
        (listing_id,),
    ).fetchone()
    if listing is None:
        raise RentalError(404, "Listing not found")
    if listing["owner_id"] == borrower_id:
        raise RentalError(400, "You can't request your own listing")
    if listing["availability_status"] != "available":
        raise RentalError(409, "This listing isn't available right now")
    row = conn.execute(
        "insert into rental_requests (listing_id, borrower_id, start_date, end_date, message)"
        " values (%s, %s, %s, %s, %s) returning id",
        (listing_id, borrower_id, start_date, end_date, message),
    ).fetchone()
    rental = get_rental(conn, row["id"])
    assert rental is not None
    return rental


def transition(
    conn: psycopg.Connection, rental_id: UUID, profile_id: UUID, action: Action
) -> RentalRequest:
    # Lock the request so two concurrent actions can't both pass the rule check.
    row = conn.execute(
        "select r.status, r.borrower_id, r.listing_id, l.owner_id"
        " from rental_requests r join listings l on l.id = r.listing_id"
        " where r.id = %s for update of r",
        (rental_id,),
    ).fetchone()
    if row is None or profile_id not in (row["borrower_id"], row["owner_id"]):
        raise RentalError(404, "Rental request not found")
    role: Role = "owner" if profile_id == row["owner_id"] else "borrower"
    target = next_status(action, row["status"], role)
    try:
        with conn.transaction():
            conn.execute(
                "update rental_requests set status = %s, updated_at = now() where id = %s",
                (target, rental_id),
            )
    except errors.ExclusionViolation as error:
        raise RentalError(
            409, "Those dates overlap another accepted booking for this listing"
        ) from error
    if target in LISTING_AVAILABILITY_AFTER:
        conn.execute(
            "update listings set availability_status = %s, updated_at = now() where id = %s",
            (LISTING_AVAILABILITY_AFTER[target], row["listing_id"]),
        )
    rental = get_rental(conn, rental_id)
    assert rental is not None
    return rental
