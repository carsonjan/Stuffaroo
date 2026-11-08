"""Auth0 access-token verification and the current-user dependency.

The Next.js server signs users in with Auth0 and forwards the access token as
`Authorization: Bearer <token>`. This module trusts nothing else: it checks the
signature against the tenant's JWKS, plus issuer, audience and expiry, and maps
the `sub` claim to a profile.
"""

import logging
from typing import Annotated, Any

import httpx
import jwt
import psycopg
from fastapi import Depends, Header, HTTPException

from app.core.config import get_settings
from app.core.db import get_conn
from app.models.schemas import Profile
from app.services import profiles

logger = logging.getLogger(__name__)

_jwks_clients: dict[str, jwt.PyJWKClient] = {}


def signing_key(token: str, domain: str) -> Any:
    """Public key for the token's `kid`, from the tenant JWKS (cached)."""
    client = _jwks_clients.get(domain)
    if client is None:
        client = jwt.PyJWKClient(
            f"https://{domain}/.well-known/jwks.json", cache_keys=True, timeout=5
        )
        _jwks_clients[domain] = client
    return client.get_signing_key_from_jwt(token).key


def fetch_userinfo(token: str, domain: str) -> dict[str, Any]:
    """Name, email and picture for a first sign-in. Empty dict if unavailable."""
    try:
        response = httpx.get(
            f"https://{domain}/userinfo",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5,
        )
        response.raise_for_status()
        info = response.json()
        return info if isinstance(info, dict) else {}
    except (httpx.HTTPError, ValueError) as error:
        logger.warning("Auth0 /userinfo failed: %s", error)
        return {}


def verify_token(token: str) -> str:
    """Returns the verified `sub` claim, or raises 401/503."""
    settings = get_settings()
    if not settings.auth0_domain or not settings.auth0_audience:
        raise HTTPException(503, "Sign-in is not configured on the API")
    try:
        claims = jwt.decode(
            token,
            signing_key(token, settings.auth0_domain),
            algorithms=["RS256"],
            audience=settings.auth0_audience,
            issuer=f"https://{settings.auth0_domain}/",
            options={"require": ["exp", "iat", "sub"]},
        )
    except (jwt.PyJWTError, jwt.PyJWKClientError) as error:
        raise HTTPException(401, "Invalid or expired token") from error
    return str(claims["sub"])


def bearer_token(authorization: str | None) -> str:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(401, "Sign in required")
    return token


def _profile_id_for(conn: psycopg.Connection, sub: str, token: str) -> Any:
    row = conn.execute(
        "select id from profiles where auth0_user_id = %s", (sub,)
    ).fetchone()
    if row:
        return row["id"]

    info = fetch_userinfo(token, get_settings().auth0_domain or "")
    email = info.get("email") if isinstance(info.get("email"), str) else None
    verified = info.get("email_verified") is True
    if email and verified:
        # Demo accounts take over the seeded profile with the same verified email.
        linked = conn.execute(
            "update profiles set auth0_user_id = %s where id = ("
            " select id from profiles where lower(email) = lower(%s)"
            " and email_verified and auth0_user_id is null limit 1"
            ") returning id",
            (sub, email),
        ).fetchone()
        if linked:
            return linked["id"]

    name = info.get("name") if isinstance(info.get("name"), str) else None
    display_name = (name or (email.split("@")[0] if email else "") or "Student")[:80]
    picture = info.get("picture") if isinstance(info.get("picture"), str) else None
    conn.execute(
        "insert into profiles (auth0_user_id, display_name, email, email_verified, avatar_url)"
        " values (%s, %s, %s, %s, %s) on conflict (auth0_user_id) do nothing",
        (sub, display_name, email, verified, picture),
    )
    row = conn.execute(
        "select id from profiles where auth0_user_id = %s", (sub,)
    ).fetchone()
    return row["id"]


def get_current_profile(
    conn: Annotated[psycopg.Connection, Depends(get_conn)],
    authorization: Annotated[str | None, Header()] = None,
) -> Profile:
    token = bearer_token(authorization)
    sub = verify_token(token)
    profile = profiles.get_profile(conn, _profile_id_for(conn, sub, token))
    if profile is None:  # pragma: no cover - the row was just read or written
        raise HTTPException(500, "Profile could not be loaded")
    return profile


CurrentProfile = Annotated[Profile, Depends(get_current_profile)]
