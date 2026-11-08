# API contract

FastAPI in `apps/api` serves everything under `/api`. FastAPI's generated OpenAPI (`/openapi.json`, `/docs`) is the source of truth; this file is the human summary. Keep them in step.

## Conventions

- JSON field names are **camelCase** (Pydantic aliases). Path and query parameters are snake_case.
- IDs are UUID strings.
- Money is **integer cents** (`pricePerDayCents`, `depositCents`, `budgetPerDayCents`). `null` price means free to borrow. `null` budget means no budget.
- Dates are `YYYY-MM-DD`. Timestamps are ISO 8601 with timezone.
- Errors are `{"detail": "<message>"}` with a fitting status code: 400 invalid input, 401 missing or bad token, 403 not allowed, 404 not found, 409 conflict, 503 an integration is not configured.
- Categories: `electronics`, `cameras`, `textbooks`, `outdoor`, `music`, `kitchen`, `tools`, `sports`.
- Conditions: `New`, `Like new`, `Good`, `Fair`.

## Auth

Protected endpoints need `Authorization: Bearer <Auth0 access token>`. The Next.js server gets the token from its Auth0 session and forwards it; the browser never calls the API directly.

FastAPI verifies the token itself (signature via the tenant JWKS, issuer, audience, expiry) and maps `sub` to a profile. On the first authenticated call it creates the profile from Auth0's `/userinfo`. If a seeded profile has the same **verified** email and no Auth0 user yet, it is linked instead (this is how demo accounts take over seeded data).

If `AUTH0_DOMAIN` or `AUTH0_AUDIENCE` is not set, protected endpoints return 503.

## Types

```ts
type Profile = {
  id: string;
  displayName: string;
  campus: string | null;
  program: string | null;
  initials: string;
  joinedAt: string;        // timestamp
  completedLends: number;  // completed rentals as owner
};

type Listing = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  pricePerDayCents: number | null;
  depositCents: number | null;
  location: string;
  availability: "available" | "on_loan" | "paused";
  createdAt: string;
};

type ListingDetail = Listing & { owner: Profile };

type WantedPost = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: Category;
  budgetPerDayCents: number | null;
  startDate: string;
  endDate: string;
  status: "open" | "fulfilled" | "closed";
  createdAt: string;
  author: Profile;
};

type Match = {
  listing: ListingDetail;
  score: number;   // 0..1, higher is closer. Relative ranking only, not a probability.
  reason: string;  // built from real listing attributes, never model-generated
};

type MatchResult = {
  method: "vector" | "keyword";  // "keyword" = Gemini/embeddings unavailable; say so in the UI
  matches: Match[];
};

type RentalStatus = "pending" | "accepted" | "rejected" | "cancelled" | "active" | "completed";

type RentalRequest = {
  id: string;
  listingId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
  listing: ListingDetail;
  borrower: Profile;
};
```

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | no | Liveness |
| GET | `/api/me` | yes | Current profile (created on first call) |
| GET | `/api/me/listings` | yes | My listings, any availability |
| GET | `/api/me/wanted` | yes | My wanted posts |
| GET | `/api/listings` | no | Browse. Query: `q`, `category`, `price` (`free` or a whole-dollar max, exclusive), `include_unavailable` (bool). Returns `ListingDetail[]`, newest first |
| GET | `/api/listings/{id}` | no | `ListingDetail` |
| POST | `/api/listings` | yes | Create. Body: `title`, `description`, `category`, `condition`, `pricePerDayCents`, `depositCents`, `location`. Returns `ListingDetail` (201). Embedding is computed when Gemini is configured |
| GET | `/api/profiles/{id}` | no | `{ profile: Profile, listings: ListingDetail[] }` |
| GET | `/api/wanted` | no | Open wanted posts, newest first |
| GET | `/api/wanted/{id}` | no | `WantedPost` |
| POST | `/api/wanted` | yes | Create. Body: `title`, `description`, `category`, `budgetPerDayCents`, `startDate`, `endDate`. Returns `WantedPost` (201) |
| GET | `/api/wanted/{id}/matches` | no | `MatchResult` for a saved wanted post |
| POST | `/api/matches` | no | `MatchResult` for an unsaved need. Body: `text`, optional `category`, `budgetPerDayCents`, `startDate`, `endDate` |
| POST | `/api/rentals` | yes | Request a listing. Body: `listingId`, `startDate`, `endDate`, `message`. Returns `RentalRequest` (201) |
| GET | `/api/rentals` | yes | Query `role=owner` (incoming) or `role=borrower` (mine). `RentalRequest[]` |
| GET | `/api/rentals/{id}` | yes | One request. Only the borrower or the listing owner can see it; anyone else gets 404, so its existence doesn't leak |
| POST | `/api/rentals/{id}/transition` | yes | Body `{ "action": "accept" \| "reject" \| "cancel" \| "start" \| "complete" }`. Returns the updated `RentalRequest` |

## Rental rules (enforced in the API)

| Action | From | To | Who |
| --- | --- | --- | --- |
| accept | pending | accepted | listing owner |
| reject | pending | rejected | listing owner |
| cancel | pending | cancelled | borrower |
| start ("mark handed over") | accepted | active | listing owner |
| complete ("mark returned") | active | completed | listing owner |

- You cannot request your own listing (400), or a listing that is not `available` (409).
- `endDate` must be on or after `startDate`.
- Accepting fails with 409 if the dates overlap another `accepted` or `active` request for the same listing.
- `start` sets the listing to `on_loan`; `complete` sets it back to `available`.
- Acting on someone else's request returns 404; the wrong party (for example the borrower trying to accept) gets 403; the wrong current status gets 409.
- The database also enforces the overlap rule (an exclusion constraint), so it holds even under concurrent accepts.

## Matching

1. Hard filters in SQL: listing `available`, same category when one is given, price within budget when one is given, not the requester's own listing.
2. Rank: with Gemini configured, embed the need (`RETRIEVAL_QUERY`) and order by cosine distance to listing embeddings (`RETRIEVAL_DOCUMENT`, 768 dims) using the DiskANN index. Otherwise fall back to keyword ranking and return `method: "keyword"`.
3. Drop weak vector matches below a similarity floor. Return at most 6.
4. `reason` lists the attributes that fit (category, price vs budget, pickup area, free to borrow), so it never claims anything the listing doesn't have.
