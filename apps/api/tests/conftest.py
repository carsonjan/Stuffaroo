"""Shared fixtures. Database tests run against a throwaway `stuffaroo_test`
database on the Postgres in DATABASE_URL (default: the local Docker container).

If that server is unreachable, database tests are skipped locally. CI sets
REQUIRE_TEST_DB=1 so they fail instead of silently skipping.
"""

import json
import os
from collections.abc import Iterator

import psycopg
import pytest
from fastapi.testclient import TestClient
from psycopg import sql

from app.core import config, db
from app.seed.__main__ import DATA_FILE, seed

ADMIN_URL = os.environ.get(
    "TEST_ADMIN_DATABASE_URL", "postgresql://postgres:stuffaroo@localhost:5433/postgres"
)
TEST_DB = "stuffaroo_test"


def _test_url() -> str:
    return psycopg.conninfo.make_conninfo(ADMIN_URL, dbname=TEST_DB)


@pytest.fixture(scope="session")
def database_url() -> Iterator[str]:
    try:
        admin = psycopg.connect(ADMIN_URL, autocommit=True, connect_timeout=3)
    except psycopg.OperationalError as error:
        if os.environ.get("REQUIRE_TEST_DB") == "1":
            raise
        pytest.skip(
            f"Test database unavailable ({error.__class__.__name__}); start it per README"
        )
    with admin:
        admin.execute(
            sql.SQL("drop database if exists {} with (force)").format(
                sql.Identifier(TEST_DB)
            )
        )
        admin.execute(sql.SQL("create database {}").format(sql.Identifier(TEST_DB)))
    url = _test_url()
    db.migrate(url)
    yield url


@pytest.fixture
def client(database_url: str, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    """App client on a freshly reseeded database."""
    with psycopg.connect(database_url) as conn:
        conn.execute(
            "truncate deposits, rental_requests, wanted_posts, listing_images, listings, profiles cascade"
        )
        seed(conn, json.loads(DATA_FILE.read_text()))
    # Tests never read apps/api/.env, so real Gemini/Auth0 settings there are ignored.
    monkeypatch.setitem(config.Settings.model_config, "env_file", None)
    for name in (
        "GEMINI_API_KEY",
        "GOOGLE_GENAI_USE_VERTEXAI",
        "GOOGLE_CLOUD_PROJECT",
        "AUTH0_DOMAIN",
        "AUTH0_AUDIENCE",
    ):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("DATABASE_URL", database_url)
    config.get_settings.cache_clear()
    db.close_pool()
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
    db.close_pool()
    config.get_settings.cache_clear()


AUTH0_DOMAIN = "stuffaroo-test.us.auth0.com"
AUTH0_AUDIENCE = "https://api.stuffaroo.test"


class TokenFactory:
    """Signs RS256 access tokens like Auth0 would, with a throwaway key."""

    def __init__(self) -> None:
        from cryptography.hazmat.primitives.asymmetric import rsa

        self.key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.userinfo: dict[str, dict] = {}

    def token(
        self,
        sub: str,
        *,
        key=None,
        audience: str = AUTH0_AUDIENCE,
        expires_in: int = 3600,
    ) -> str:
        import time

        import jwt

        now = int(time.time())
        claims = {
            "sub": sub,
            "iss": f"https://{AUTH0_DOMAIN}/",
            "aud": [audience, f"https://{AUTH0_DOMAIN}/userinfo"],
            "iat": now,
            "exp": now + expires_in,
        }
        return jwt.encode(claims, key or self.key, algorithm="RS256")

    def headers(self, sub: str, **userinfo: object) -> dict[str, str]:
        """Auth header for `sub`; userinfo is what Auth0 /userinfo would return."""
        self.userinfo[sub] = {"sub": sub, **userinfo}
        return {"Authorization": f"Bearer {self.token(sub)}"}


@pytest.fixture
def auth(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> TokenFactory:
    """Configures Auth0 settings and replaces JWKS and /userinfo lookups."""
    import jwt

    from app.core import auth as auth_module

    factory = TokenFactory()
    monkeypatch.setenv("AUTH0_DOMAIN", AUTH0_DOMAIN)
    monkeypatch.setenv("AUTH0_AUDIENCE", AUTH0_AUDIENCE)
    config.get_settings.cache_clear()
    monkeypatch.setattr(
        auth_module, "signing_key", lambda token, domain: factory.key.public_key()
    )

    def userinfo(token: str, domain: str) -> dict:
        sub = jwt.decode(token, options={"verify_signature": False})["sub"]
        return factory.userinfo.get(sub, {})

    monkeypatch.setattr(auth_module, "fetch_userinfo", userinfo)
    return factory
