from fastapi.testclient import TestClient

from app.seed.__main__ import seed_id


def test_browse_hides_unavailable_by_default(client: TestClient) -> None:
    listings = client.get("/api/listings").json()
    assert listings
    assert {item["availability"] for item in listings} == {"available"}
    every = client.get("/api/listings", params={"include_unavailable": True}).json()
    assert len(every) > len(listings)


def test_browse_filters(client: TestClient) -> None:
    cameras = client.get("/api/listings", params={"category": "cameras"}).json()
    assert cameras and all(item["category"] == "cameras" for item in cameras)

    free = client.get("/api/listings", params={"price": "free"}).json()
    assert free and all(item["pricePerDayCents"] is None for item in free)

    cheap = client.get("/api/listings", params={"price": "5"}).json()
    assert all((item["pricePerDayCents"] or 0) < 500 for item in cheap)

    keyboard = client.get("/api/listings", params={"q": "keyboard"}).json()
    assert keyboard and all(
        "keyboard" in (i["title"] + i["description"]).lower() for i in keyboard
    )


def test_browse_rejects_bad_price(client: TestClient) -> None:
    response = client.get("/api/listings", params={"price": "cheap"})
    assert response.status_code == 400
    assert "price" in response.json()["detail"]


def test_listing_detail_includes_owner_in_camel_case(client: TestClient) -> None:
    listing = client.get(f"/api/listings/{seed_id('l-1')}").json()
    assert listing["ownerId"] == str(seed_id("u-jordan"))
    assert listing["owner"]["displayName"] == "Jordan Okafor"
    assert isinstance(listing["pricePerDayCents"], int)


def test_unknown_listing_is_404(client: TestClient) -> None:
    response = client.get("/api/listings/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    assert response.json() == {"detail": "Listing not found"}


def test_profile_lists_all_of_their_listings(client: TestClient) -> None:
    body = client.get(f"/api/profiles/{seed_id('u-jordan')}").json()
    assert body["profile"]["initials"] == "JO"
    assert body["listings"]
    assert all(item["ownerId"] == str(seed_id("u-jordan")) for item in body["listings"])
