# Sponsor evidence

Only technologies that power a real feature are listed. Each section says what has been verified against the live service and what hasn't.

## Sponsor: Tiger Data

### Technology used
Tiger Cloud (managed Postgres) with **pgvector** and **pgvectorscale** (StreamingDiskANN index).

### Problem solved
Stuffaroo needs ordinary relational data (students, listings, requests, bookings) and vector search for matching, in one place. Using one Postgres avoids a second database and lets matching combine hard SQL filters with vector ranking in a single query.

### Implementation
- Schema: `apps/api/migrations/001_init.sql`:
  - `create extension vectorscale cascade` (installs pgvector)
  - a `vector(768)` embedding column on listings
  - `create index … using diskann (embedding vector_cosine_ops)`
  - a `btree_gist` exclusion constraint so overlapping accepted bookings can't exist
- Matching query: `apps/api/app/services/matching.py`:
  - SQL filters for availability, category, budget, not booked on the requested dates, and not the requester's own listing
  - then `order by embedding <=> query_vector` on the DiskANN index
- Local development and CI use `timescale/timescaledb-ha:pg17`, the same Postgres + pgvector + pgvectorscale stack (`pnpm db:up`, `.github/workflows/ci.yml`).

### Demo
Post a need at `/marketplace/wanted/new` or open a wanted post. Matches come from the vector query, and listings that are booked, unavailable, over budget or your own never appear.

### Evidence
- `apps/api/tests/test_matching.py` runs against the real extension stack. It covers the booked-dates filter (the Sony camera is booked, so only the Canon matches), budget, own-listing, unavailable items, and a request with no compatible listing.
- `apps/api/tests/test_rentals.py::test_overlapping_bookings_cannot_both_be_accepted` exercises the exclusion constraint.

### Limitations
- Verified on the Tiger image locally and in CI. **Not yet run against a Tiger Cloud service.** Set `DATABASE_URL` in `apps/api/.env`, then run `pnpm db:migrate && pnpm db:seed && pnpm db:embed`.
- The seed has 12 listings, so the index is there for correctness, not yet for scale.

## Sponsor: Google (Gemini on Vertex AI)

### Technology used
Gemini text embeddings (`gemini-embedding-001`, 768 dimensions) through **Vertex AI** on a Google Cloud project, via the `google-genai` SDK. An AI Studio API key is supported as a fallback.

### Problem solved
Students describe needs in their own words ("something to film a club event"). Keyword search misses many of these. Embeddings let a need match a listing by meaning.

### Implementation
- `apps/api/app/services/embeddings.py`:
  - embeds listings as `RETRIEVAL_DOCUMENT` and needs as `RETRIEVAL_QUERY`
  - normalizes the vectors and validates their dimensions
  - selects Vertex AI or an API key from config
- **Listings:** each new listing is embedded on create (`app/services/listings.py`). `pnpm db:embed` backfills listings that don't have a vector yet.
- **Fallback:** if Gemini is missing or fails, matching returns `method: "keyword"`, and the UI says "Keyword match (AI matching unavailable)". It is never presented as AI.
- **Reasons:** the "why this matches" text is built from real listing fields, not written by the model.

### Demo
With Gemini configured, match results show "Ranked with Gemini embeddings".

### Evidence
Tests use a deterministic fake embedder for the vector path, the failure-to-keyword fallback, embedding on create, and backend selection (`test_matching.py`, `test_rentals.py`).

### Limitations
- **Not yet verified with live Vertex AI.** The first real call reached Google with valid credentials, but the project's Vertex AI ("Agent Platform") API wasn't enabled yet.
- The 0.55 similarity floor is a starting guess, to tune once real embeddings exist.
- AI listing drafts are still a labelled mockup.

## Sponsor: Auth0

### Technology used
`@auth0/nextjs-auth0` v4 in Next.js 16, and Auth0 access tokens (RS256) verified by FastAPI.

### Problem solved
Every write (listings, wanted posts, rental requests, accepting a booking) must belong to a real student, and the API must never trust a user ID sent by the client.

### Implementation
- **Next.js:**
  - `apps/web/src/lib/auth0.ts` creates the client only when configured.
  - `apps/web/src/proxy.ts` mounts the `/auth/*` routes.
  - `apps/web/src/lib/viewer.ts` reads the session per request.
  - `apps/web/src/lib/api.ts` forwards the access token to the API.
- **FastAPI** (`apps/api/app/core/auth.py`):
  - verifies the signature against the tenant JWKS, plus issuer, audience and expiry
  - creates a profile on first sign-in
  - links a seeded demo profile only when the email is verified
- **Ownership and roles** are checked server-side (`app/services/rentals.py`).

### Demo
Sign in, list an item as one student, request it as another, then accept it from the first student's dashboard. Setup steps: `docs/handoff-auth0.md`.

### Evidence
- `apps/api/tests/test_auth.py`: 401 for bad, expired or wrong-audience tokens; 503 when unconfigured; one profile per login; linking by verified email only.
- `test_rentals.py`: role and ownership rules.
- A browser run with two students, using locally signed tokens inside real SDK session cookies, went from request to accept to hand-over.

### Limitations
**Not yet run against a real Auth0 tenant**, so the login redirect, the callback and `/userinfo` are unverified.

## Not claimed

- **Solana:** the deposit page (`/marketplace/deposits`) is a clearly labelled simulation. No wallet is contacted and no transaction is sent.
- **Freebuff, Entire, Databricks, GoDaddy:** no integration in the product code.
