"""Load the fictional demo data (`demo_data.json`) into the database.

Run with `uv run python -m app.seed`. Safe to run more than once: rows are keyed
by stable UUIDs derived from the sample IDs and existing rows are left alone.
"""

import json
import uuid
from pathlib import Path
from typing import Any

import psycopg

from app.core.config import get_settings

DATA_FILE = Path(__file__).with_name("demo_data.json")
SEED_NAMESPACE = uuid.UUID("5c1b8f2e-2a4d-4f53-9a3f-7d3c0e6f1a10")
DEMO_EMAIL_DOMAIN = "demo.stuffaroo.dev"


def seed_id(sample_id: str) -> uuid.UUID:
    return uuid.uuid5(SEED_NAMESPACE, sample_id)


def to_cents(dollars: float | None) -> int | None:
    return None if dollars is None else round(dollars * 100)


def demo_email(sample_profile_id: str) -> str:
    # "u-maya" -> "maya@demo.stuffaroo.dev". Create Auth0 users with these
    # emails to sign in as the seeded students (see docs/handoff-auth0.md).
    return f"{sample_profile_id.removeprefix('u-')}@{DEMO_EMAIL_DOMAIN}"


def seed(conn: psycopg.Connection, data: dict[str, Any]) -> dict[str, int]:
    counts = {"profiles": 0, "listings": 0, "wanted_posts": 0, "rental_requests": 0}
    for p in data["profiles"]:
        cur = conn.execute(
            "insert into profiles (id, display_name, email, email_verified, campus, program, created_at)"
            " values (%s, %s, %s, true, %s, %s, %s) on conflict (id) do nothing",
            (
                seed_id(p["id"]),
                p["displayName"],
                demo_email(p["id"]),
                p["campus"],
                p["program"],
                p["joined"],
            ),
        )
        counts["profiles"] += cur.rowcount
    for item in data["listings"]:
        cur = conn.execute(
            "insert into listings (id, owner_id, title, description, category, condition,"
            " price_per_day_cents, deposit_cents, location, availability_status, created_at, updated_at)"
            " values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) on conflict (id) do nothing",
            (
                seed_id(item["id"]),
                seed_id(item["ownerId"]),
                item["title"],
                item["description"],
                item["category"],
                item["condition"],
                to_cents(item["pricePerDay"]),
                to_cents(item["depositAmount"]),
                item["location"],
                item["availability"],
                item["createdAt"],
                item["createdAt"],
            ),
        )
        counts["listings"] += cur.rowcount
    for w in data["wantedPosts"]:
        cur = conn.execute(
            "insert into wanted_posts (id, user_id, title, description, category, budget_per_day_cents,"
            " start_date, end_date, status, created_at)"
            " values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) on conflict (id) do nothing",
            (
                seed_id(w["id"]),
                seed_id(w["userId"]),
                w["title"],
                w["description"],
                w["category"],
                to_cents(w["budgetPerDay"]),
                w["startDate"],
                w["endDate"],
                w["status"],
                w["createdAt"],
            ),
        )
        counts["wanted_posts"] += cur.rowcount
    for r in data["rentalRequests"]:
        cur = conn.execute(
            "insert into rental_requests (id, listing_id, borrower_id, start_date, end_date, status,"
            " message, created_at, updated_at)"
            " values (%s, %s, %s, %s, %s, %s, %s, %s, %s) on conflict (id) do nothing",
            (
                seed_id(r["id"]),
                seed_id(r["listingId"]),
                seed_id(r["borrowerId"]),
                r["startDate"],
                r["endDate"],
                r["status"],
                r["message"],
                r["createdAt"],
                r["createdAt"],
            ),
        )
        counts["rental_requests"] += cur.rowcount
    return counts


def main() -> None:
    data = json.loads(DATA_FILE.read_text())
    with psycopg.connect(get_settings().database_url) as conn:
        counts = seed(conn, data)
    print("Inserted " + ", ".join(f"{n} {table}" for table, n in counts.items()))


if __name__ == "__main__":
    main()
