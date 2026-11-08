"""Check that the real services are set up: `pnpm check:setup`.

Checks the database (Tiger Cloud or local), Gemini, and Auth0 for both the API
(apps/api/.env) and the web app (apps/web/.env.local). Prints one line per
check with a fix for anything wrong. Never prints secret values. Exits 1 if
any check fails.
"""

import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import httpx
import psycopg

from app.core.config import API_ROOT, get_settings
from app.core.db import MIGRATIONS_DIR
from app.services import embeddings, relevance

WEB_ENV = API_ROOT.parent / "web" / ".env.local"
REQUIRED_EXTENSIONS = ("vector", "vectorscale", "btree_gist")
WEB_REQUIRED = (
    "API_URL",
    "AUTH0_DOMAIN",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
    "AUTH0_SECRET",
    "APP_BASE_URL",
    "AUTH0_AUDIENCE",
)

failures = 0


def ok(message: str) -> None:
    print(f"  ✓ {message}")


def bad(message: str, fix: str) -> None:
    global failures
    failures += 1
    print(f"  ✗ {message}\n      fix: {fix}")


def skip(message: str) -> None:
    print(f"  - {message}")


def check_database() -> None:
    print("Database")
    url = get_settings().database_url
    host = urlparse(url).hostname or "?"
    local = host in ("localhost", "127.0.0.1")
    print(f"  target: {'local Docker' if local else 'remote'} ({host})")
    if not local and "sslmode=require" not in url:
        bad(
            "remote DATABASE_URL without sslmode=require",
            "append ?sslmode=require (Tiger Cloud requires TLS)",
        )
    try:
        conn = psycopg.connect(url, connect_timeout=10, prepare_threshold=None)
    except psycopg.OperationalError as error:
        first_line = str(error).strip().splitlines()[0] if str(error).strip() else ""
        bad(
            f"can't connect: {first_line}",
            "check DATABASE_URL in apps/api/.env, or run `pnpm db:up` for local",
        )
        return
    with conn:
        version = conn.execute("show server_version").fetchone()[0]
        ok(f"connected (Postgres {version})")
        available = {
            row[0]
            for row in conn.execute(
                "select name from pg_available_extensions where name = any(%s)",
                (list(REQUIRED_EXTENSIONS),),
            )
        }
        for name in REQUIRED_EXTENSIONS:
            if name in available:
                ok(f"extension {name} available")
            else:
                bad(
                    f"extension {name} not available",
                    "use a Tiger Cloud service (it ships pgvector + pgvectorscale)",
                )
        migrations = sorted(p.stem for p in MIGRATIONS_DIR.glob("*.sql"))
        applied = set()
        if conn.execute("select to_regclass('schema_migrations')").fetchone()[0]:
            applied = {
                r[0] for r in conn.execute("select version from schema_migrations")
            }
        missing = [m for m in migrations if m not in applied]
        if missing:
            bad(
                f"migrations not applied: {', '.join(missing)}", "run `pnpm db:migrate`"
            )
            return
        ok(f"migrations applied ({len(migrations)})")
        listings, embedded = conn.execute(
            "select count(*), count(embedding) from listings"
        ).fetchone()
        profiles = conn.execute("select count(*) from profiles").fetchone()[0]
        if listings == 0:
            bad("no listings", "run `pnpm db:seed`")
        else:
            ok(f"{profiles} profiles, {listings} listings")
        if listings and embedded < listings:
            bad(
                f"{listings - embedded} of {listings} listings have no embedding",
                "run `pnpm db:embed` (needs Gemini)",
            )
        elif listings:
            ok("every listing has an embedding")


def check_gemini() -> None:
    print("Gemini")
    settings = get_settings()
    if not embeddings.is_configured():
        bad(
            "not configured (matching will use the keyword fallback)",
            "set GOOGLE_GENAI_USE_VERTEXAI=true and GOOGLE_CLOUD_PROJECT in apps/api/.env",
        )
        return
    backend = (
        f"Vertex AI, project {settings.google_cloud_project}"
        if settings.google_genai_use_vertexai and settings.google_cloud_project
        else "AI Studio key"
    )
    try:
        embeddings.embed_texts(["setup check"], "RETRIEVAL_QUERY")
        ok(f"embeddings work ({backend}, {settings.gemini_embedding_model})")
    except embeddings.EmbeddingError as error:
        bad(
            f"embeddings failed: {str(error)[:160]}",
            "enable the Vertex AI API and run `gcloud auth application-default login`",
        )
    if not relevance.is_enabled():
        skip("relevance check is off")
        return
    try:
        _probe_relevance_model()
        ok(f"relevance model works ({settings.gemini_relevance_model})")
    except relevance.RelevanceError as error:
        bad(
            f"relevance model failed: {str(error)[:160]}",
            "check GEMINI_RELEVANCE_MODEL / GEMINI_RELEVANCE_LOCATION (text models use 'global')",
        )


def _probe_relevance_model() -> None:
    """One tiny real call through the same code path the API uses."""
    from datetime import UTC, datetime
    from uuid import uuid4

    from app.models.schemas import ListingDetail, Profile

    owner = Profile(
        id=uuid4(),
        display_name="Setup Check",
        campus=None,
        program=None,
        initials="SC",
        joined_at=datetime.now(UTC),
        completed_lends=0,
    )
    listing = ListingDetail(
        id=uuid4(),
        owner_id=owner.id,
        title="Tent",
        description="Two-person tent",
        category="outdoor",
        condition="Good",
        price_per_day_cents=None,
        deposit_cents=None,
        location="Campus",
        availability="available",
        created_at=datetime.now(UTC),
        owner=owner,
    )
    relevance.fitting_indices("a tent for camping", [listing])


def check_auth0_api() -> str | None:
    print("Auth0 (API: apps/api/.env)")
    settings = get_settings()
    domain, audience = settings.auth0_domain, settings.auth0_audience
    if not domain or not audience:
        bad(
            "AUTH0_DOMAIN and/or AUTH0_AUDIENCE not set (signed-in endpoints return 503)",
            "set both in apps/api/.env (see docs/handoff-auth0.md)",
        )
        return None
    if domain.startswith("http") or "/" in domain:
        bad(
            f"AUTH0_DOMAIN looks like a URL: {domain}",
            "use the bare host, e.g. your-tenant.us.auth0.com",
        )
        return None
    try:
        config = httpx.get(
            f"https://{domain}/.well-known/openid-configuration", timeout=10
        )
        config.raise_for_status()
        issuer = config.json().get("issuer")
        if issuer != f"https://{domain}/":
            bad(
                f"issuer mismatch ({issuer})",
                "AUTH0_DOMAIN must be the tenant's domain",
            )
        else:
            ok(f"tenant reachable ({domain})")
        keys = httpx.get(config.json()["jwks_uri"], timeout=10).json().get("keys", [])
        if keys:
            ok(f"signing keys published ({len(keys)})")
        else:
            bad(
                "tenant publishes no signing keys",
                "check the tenant in the Auth0 dashboard",
            )
    except (httpx.HTTPError, ValueError, KeyError) as error:
        bad(f"can't reach the tenant: {error}", "check AUTH0_DOMAIN")
    ok(f"audience set ({audience})")
    return audience


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in path.read_text().splitlines():
        match = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$", line)
        if match and not line.lstrip().startswith("#"):
            values[match.group(1)] = match.group(2).strip("\"'")
    return values


def check_auth0_web(api_audience: str | None) -> None:
    print("Auth0 (web: apps/web/.env.local)")
    if not WEB_ENV.exists():
        bad(
            "apps/web/.env.local not found (the site runs with sign-in off)",
            "cp apps/web/.env.example apps/web/.env.local and fill it in",
        )
        return
    env = read_env_file(WEB_ENV)
    missing = [key for key in WEB_REQUIRED if not env.get(key)]
    if missing:
        bad(f"empty: {', '.join(missing)}", "fill these in apps/web/.env.local")
    else:
        ok("all Auth0 variables set")
    secret = env.get("AUTH0_SECRET", "")
    if secret and not re.fullmatch(r"[0-9a-fA-F]{64}", secret):
        bad(
            "AUTH0_SECRET isn't 32-byte hex", "generate one with `openssl rand -hex 32`"
        )
    settings = get_settings()
    if env.get("AUTH0_DOMAIN") and env.get("AUTH0_DOMAIN") != settings.auth0_domain:
        bad(
            "AUTH0_DOMAIN differs between web and API",
            "use the same tenant domain in both files",
        )
    if (
        env.get("AUTH0_AUDIENCE")
        and api_audience
        and env["AUTH0_AUDIENCE"] != api_audience
    ):
        bad(
            "AUTH0_AUDIENCE differs between web and API (every API call would get 401)",
            "use the same API identifier in both files",
        )
    for key in ("NEXT_PUBLIC_AUTH0_SECRET", "NEXT_PUBLIC_AUTH0_CLIENT_SECRET"):
        if key in env:
            bad(f"{key} would expose a secret to the browser", f"remove {key}")


def main() -> None:
    check_database()
    check_gemini()
    audience = check_auth0_api()
    check_auth0_web(audience)
    print()
    if failures:
        print(f"{failures} problem(s) found.")
        sys.exit(1)
    print("Everything is set up.")


if __name__ == "__main__":
    main()
