import psycopg
import pytest
from fastapi.testclient import TestClient

from app.seed.__main__ import seed_id
from app.services import embeddings, rentals
from tests.conftest import TokenFactory
from tests.test_matching import fake_embed

CANON = str(seed_id("l-8"))  # Jordan's, available, $15/day
GUITAR = str(seed_id("l-5"))  # Aiko's, on loan


@pytest.fixture
def maya(auth: TokenFactory) -> dict[str, str]:
    return auth.headers(
        "auth0|maya", email="maya@demo.stuffaroo.dev", email_verified=True
    )


@pytest.fixture
def jordan(auth: TokenFactory) -> dict[str, str]:
    return auth.headers(
        "auth0|jordan", email="jordan@demo.stuffaroo.dev", email_verified=True
    )


@pytest.fixture
def riley(auth: TokenFactory) -> dict[str, str]:
    return auth.headers("auth0|riley", name="Riley Park", email="riley@example.edu")


def request(
    client: TestClient,
    headers: dict,
    listing: str = CANON,
    start="2026-12-01",
    end="2026-12-03",
):
    return client.post(
        "/api/rentals",
        headers=headers,
        json={
            "listingId": listing,
            "startDate": start,
            "endDate": end,
            "message": "Hi!",
        },
    )


def act(client: TestClient, headers: dict, rental_id: str, action: str):
    return client.post(
        f"/api/rentals/{rental_id}/transition", headers=headers, json={"action": action}
    )


# Pure rules, no database


@pytest.mark.parametrize(
    ("action", "current", "role", "expected"),
    [
        ("accept", "pending", "owner", "accepted"),
        ("reject", "pending", "owner", "rejected"),
        ("cancel", "pending", "borrower", "cancelled"),
        ("start", "accepted", "owner", "active"),
        ("complete", "active", "owner", "completed"),
    ],
)
def test_allowed_transitions(action, current, role, expected) -> None:
    assert rentals.next_status(action, current, role) == expected


@pytest.mark.parametrize(
    ("action", "current", "role", "status"),
    [
        ("accept", "pending", "borrower", 403),
        ("cancel", "pending", "owner", 403),
        ("cancel", "accepted", "borrower", 409),
        ("start", "pending", "owner", 409),
        ("complete", "accepted", "owner", 409),
        ("accept", "rejected", "owner", 409),
    ],
)
def test_forbidden_transitions(action, current, role, status) -> None:
    with pytest.raises(rentals.RentalError) as raised:
        rentals.next_status(action, current, role)
    assert raised.value.status == status


# Full lifecycle through the API


def test_full_rental_lifecycle(client: TestClient, maya, jordan) -> None:
    created = request(client, maya)
    assert created.status_code == 201
    rental = created.json()
    assert rental["status"] == "pending"
    assert rental["borrower"]["displayName"] == "Maya Chen"

    incoming = client.get(
        "/api/rentals", params={"role": "owner"}, headers=jordan
    ).json()
    assert rental["id"] in {r["id"] for r in incoming}
    mine = client.get("/api/rentals", params={"role": "borrower"}, headers=maya).json()
    assert rental["id"] in {r["id"] for r in mine}

    assert act(client, maya, rental["id"], "accept").status_code == 403
    assert act(client, jordan, rental["id"], "accept").json()["status"] == "accepted"

    started = act(client, jordan, rental["id"], "start").json()
    assert started["status"] == "active"
    assert started["listing"]["availability"] == "on_loan"

    done = act(client, jordan, rental["id"], "complete").json()
    assert done["status"] == "completed"
    assert done["listing"]["availability"] == "available"
    assert done["listing"]["owner"]["completedLends"] >= 1


def test_overlapping_bookings_cannot_both_be_accepted(
    client: TestClient, maya, jordan, riley
) -> None:
    first = request(client, maya, start="2026-12-10", end="2026-12-12").json()
    second = request(client, riley, start="2026-12-12", end="2026-12-14").json()
    assert act(client, jordan, first["id"], "accept").status_code == 200
    clash = act(client, jordan, second["id"], "accept")
    assert clash.status_code == 409
    assert "overlap" in clash.json()["detail"]
    # Non-overlapping dates are fine.
    third = request(client, riley, start="2026-12-13", end="2026-12-14").json()
    assert act(client, jordan, third["id"], "accept").status_code == 200


def test_borrower_can_cancel_only_while_pending(
    client: TestClient, maya, jordan
) -> None:
    rental = request(client, maya).json()
    assert act(client, maya, rental["id"], "cancel").json()["status"] == "cancelled"
    another = request(client, maya, start="2026-12-20", end="2026-12-21").json()
    act(client, jordan, another["id"], "accept")
    assert act(client, maya, another["id"], "cancel").status_code == 409


def test_request_rules(client: TestClient, maya, jordan) -> None:
    own = request(client, jordan)
    assert own.status_code == 400
    on_loan = request(client, maya, listing=GUITAR)
    assert on_loan.status_code == 409
    backwards = request(client, maya, start="2026-12-05", end="2026-12-01")
    assert backwards.status_code == 422
    missing = request(client, maya, listing="00000000-0000-0000-0000-000000000000")
    assert missing.status_code == 404
    assert client.post("/api/rentals", json={}).status_code in (401, 422)


def test_only_the_two_parties_can_see_a_request(
    client: TestClient, maya, jordan, riley
) -> None:
    rental = request(client, maya).json()
    assert client.get(f"/api/rentals/{rental['id']}", headers=maya).status_code == 200
    assert client.get(f"/api/rentals/{rental['id']}", headers=jordan).status_code == 200
    assert client.get(f"/api/rentals/{rental['id']}", headers=riley).status_code == 404
    assert act(client, riley, rental["id"], "accept").status_code == 404


def test_create_listing_and_wanted_post(
    client: TestClient, riley, database_url: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    listing = client.post(
        "/api/listings",
        headers=riley,
        json={
            "title": "Cast iron skillet",
            "description": "10 inch, well seasoned.",
            "category": "kitchen",
            "condition": "Good",
            "pricePerDayCents": None,
            "depositCents": 1000,
            "location": "West Residence",
        },
    )
    assert listing.status_code == 201
    body = listing.json()
    assert body["owner"]["displayName"] == "Riley Park"
    assert body["availability"] == "available"
    browse = client.get("/api/listings", params={"q": "skillet"}).json()
    assert [item["id"] for item in browse] == [body["id"]]

    wanted = client.post(
        "/api/wanted",
        headers=riley,
        json={
            "title": "Bike pump",
            "description": "Presta valve",
            "category": "sports",
            "budgetPerDayCents": 200,
            "startDate": "2026-12-01",
            "endDate": "2026-12-02",
        },
    )
    assert wanted.status_code == 201
    assert wanted.json()["author"]["displayName"] == "Riley Park"
    assert client.post("/api/wanted", json={}).status_code in (401, 422)
    unsigned = client.post("/api/listings", json=body | {"title": "x" * 10})
    assert unsigned.status_code == 401


def test_new_listing_is_embedded_when_gemini_is_configured(
    client: TestClient, riley, database_url: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    from app.core import config

    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    config.get_settings.cache_clear()
    monkeypatch.setattr(embeddings, "embed_texts", fake_embed)
    created = client.post(
        "/api/listings",
        headers=riley,
        json={
            "title": "Ukulele",
            "description": "Soprano ukulele with tuner",
            "category": "music",
            "condition": "Like new",
            "pricePerDayCents": 200,
            "depositCents": None,
            "location": "Music Building",
        },
    ).json()
    with psycopg.connect(database_url) as conn:
        row = conn.execute(
            "select embedding is not null from listings where id = %s", (created["id"],)
        ).fetchone()
    assert row[0] is True
