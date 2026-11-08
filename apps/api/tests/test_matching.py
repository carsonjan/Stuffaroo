import hashlib
import math
from collections.abc import Iterator

import psycopg
import pytest
from fastapi.testclient import TestClient

from app.core import config
from app.embed_listings import embed_missing
from app.seed.__main__ import seed_id
from app.services import embeddings, matching


def fake_embed(texts: list[str], task_type: str) -> list[list[float]]:
    """Deterministic bag-of-words vectors: shared words mean closer vectors."""
    vectors = []
    for text in texts:
        values = [0.0] * config.EMBEDDING_DIMENSIONS
        for word in matching.tokens(text):
            index = int(hashlib.sha256(word.encode()).hexdigest(), 16) % len(values)
            values[index] += 1.0
        values[0] += 0.1  # never all-zero
        norm = math.sqrt(sum(v * v for v in values))
        vectors.append([v / norm for v in values])
    return vectors


@pytest.fixture
def vector_client(
    client: TestClient, database_url: str, monkeypatch: pytest.MonkeyPatch
) -> Iterator[TestClient]:
    """Client with 'Gemini' configured (fake embedder) and listings embedded."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("MATCH_MIN_SIMILARITY", "0")
    config.get_settings.cache_clear()
    monkeypatch.setattr(embeddings, "embed_texts", fake_embed)
    with psycopg.connect(database_url) as conn:
        assert embed_missing(conn) == 12
    yield client
    config.get_settings.cache_clear()


def ids(result: dict) -> set[str]:
    return {m["listing"]["id"] for m in result["matches"]}


def test_wanted_list_and_detail(client: TestClient) -> None:
    posts = client.get("/api/wanted").json()
    assert len(posts) == 4
    assert posts[0]["author"]["displayName"]
    post = client.get(f"/api/wanted/{seed_id('w-2')}").json()
    assert post["title"] == "Mechanical keyboard for three days"
    assert post["budgetPerDayCents"] == 500
    missing = client.get("/api/wanted/00000000-0000-0000-0000-000000000000")
    assert missing.status_code == 404


def test_keyword_fallback_without_gemini(client: TestClient) -> None:
    result = client.post("/api/matches", json={"text": "mechanical keyboard"}).json()
    assert result["method"] == "keyword"
    assert str(seed_id("l-2")) in ids(result)
    assert "keyboard" in result["matches"][0]["reason"]


def test_budget_is_a_hard_filter(client: TestClient) -> None:
    tent = str(seed_id("l-3"))  # $6/day
    within = client.post(
        "/api/matches", json={"text": "backpacking tent", "category": "outdoor"}
    )
    assert tent in ids(within.json())
    over = client.post(
        "/api/matches",
        json={
            "text": "backpacking tent",
            "category": "outdoor",
            "budgetPerDayCents": 400,
        },
    )
    assert tent not in ids(over.json())


def test_unavailable_listings_never_match(vector_client: TestClient) -> None:
    result = vector_client.post("/api/matches", json={"text": "acoustic guitar"}).json()
    assert str(seed_id("l-5")) not in ids(result)  # on loan
    result = vector_client.post(
        "/api/matches", json={"text": "organic chemistry"}
    ).json()
    assert str(seed_id("l-12")) not in ids(result)  # paused


def test_vector_matches_respect_dates_budget_and_category(
    vector_client: TestClient,
) -> None:
    # w-1: Maya wants a camera Nov 14-16, up to $15/day. The Sony (l-1) is
    # already booked for those dates, so only the Canon (l-8) may match.
    result = vector_client.get(f"/api/wanted/{seed_id('w-1')}/matches").json()
    assert result["method"] == "vector"
    assert ids(result) == {str(seed_id("l-8"))}
    match = result["matches"][0]
    assert match["listing"]["category"] == "cameras"
    assert match["listing"]["pricePerDayCents"] <= 1500
    assert "free on your dates" in match["reason"]
    assert 0 <= match["score"] <= 1


def test_requester_never_matches_own_listing(vector_client: TestClient) -> None:
    # w-4 is Aiko's; Aiko's own speaker (l-11) is electronics and available.
    result = vector_client.get(f"/api/wanted/{seed_id('w-4')}/matches").json()
    assert str(seed_id("l-11")) not in ids(result)


def test_incompatible_request_gets_no_matches(vector_client: TestClient) -> None:
    # w-3 wants outdoor gear for $4/day; the only outdoor listing is $6/day.
    result = vector_client.get(f"/api/wanted/{seed_id('w-3')}/matches").json()
    assert result["matches"] == []


def test_gemini_failure_falls_back_to_keyword(
    vector_client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def broken(texts: list[str], task_type: str) -> list[list[float]]:
        raise embeddings.EmbeddingError("quota exceeded")

    monkeypatch.setattr(embeddings, "embed_texts", broken)
    result = vector_client.post(
        "/api/matches", json={"text": "mechanical keyboard"}
    ).json()
    assert result["method"] == "keyword"
    assert str(seed_id("l-2")) in ids(result)


def test_match_query_validation(client: TestClient) -> None:
    only_start = client.post(
        "/api/matches", json={"text": "tent", "startDate": "2026-11-20"}
    )
    assert only_start.status_code == 422
    backwards = client.post(
        "/api/matches",
        json={"text": "tent", "startDate": "2026-11-22", "endDate": "2026-11-20"},
    )
    assert backwards.status_code == 422
