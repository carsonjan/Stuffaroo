import pytest
from fastapi.testclient import TestClient

from app.core import config
from app.seed.__main__ import seed_id
from tests.conftest import TokenFactory


def test_protected_routes_report_missing_config(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.delenv("AUTH0_DOMAIN", raising=False)
    monkeypatch.delenv("AUTH0_AUDIENCE", raising=False)
    config.get_settings.cache_clear()
    response = client.get("/api/me", headers={"Authorization": "Bearer anything"})
    assert response.status_code == 503


def test_missing_token_is_401(client: TestClient, auth: TokenFactory) -> None:
    assert client.get("/api/me").status_code == 401
    bad_scheme = client.get("/api/me", headers={"Authorization": "Token abc"})
    assert bad_scheme.status_code == 401


@pytest.mark.parametrize(
    "make_token",
    [
        lambda f: f.token("auth0|x", key=f.other_key),  # wrong signature
        lambda f: f.token("auth0|x", audience="https://someone-else"),  # wrong audience
        lambda f: f.token("auth0|x", expires_in=-60),  # expired
        lambda f: "not.a.jwt",
    ],
)
def test_bad_tokens_are_401(client: TestClient, auth: TokenFactory, make_token) -> None:
    response = client.get(
        "/api/me", headers={"Authorization": f"Bearer {make_token(auth)}"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid or expired token"}


def test_first_sign_in_creates_one_profile(
    client: TestClient, auth: TokenFactory
) -> None:
    headers = auth.headers(
        "auth0|new-student",
        name="Riley Park",
        email="riley@example.edu",
        email_verified=True,
    )
    first = client.get("/api/me", headers=headers).json()
    assert first["displayName"] == "Riley Park"
    assert first["initials"] == "RP"
    again = client.get("/api/me", headers=headers).json()
    assert again["id"] == first["id"]
    assert client.get("/api/me/listings", headers=headers).json() == []


def test_verified_demo_email_links_the_seeded_profile(
    client: TestClient, auth: TokenFactory
) -> None:
    headers = auth.headers(
        "auth0|maya", email="maya@demo.stuffaroo.dev", email_verified=True
    )
    me = client.get("/api/me", headers=headers).json()
    assert me["id"] == str(seed_id("u-maya"))
    mine = client.get("/api/me/listings", headers=headers).json()
    assert mine and all(item["ownerId"] == me["id"] for item in mine)
    wanted = client.get("/api/me/wanted", headers=headers).json()
    assert [post["title"] for post in wanted] == ["Camera for a weekend trip"]


def test_unverified_email_never_takes_over_a_profile(
    client: TestClient, auth: TokenFactory
) -> None:
    headers = auth.headers(
        "auth0|imposter", email="maya@demo.stuffaroo.dev", email_verified=False
    )
    me = client.get("/api/me", headers=headers).json()
    assert me["id"] != str(seed_id("u-maya"))
