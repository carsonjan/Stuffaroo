# Todo: backend wiring

The frontend in `apps/web` runs entirely on sample data (`src/lib/mock-data.ts`, `src/lib/mock-shop.ts`). This list covers replacing that with a real backend, in the order the demo needs it.

Priority labels follow AGENTS.md section 2.2: **P0** is demo-critical, **P1** is valuable, **P2** is optional.

## Open decisions

Settle these before building the matching items below. Each one is a team call, not an agent call (AGENTS.md section 15).

- [ ] **Where backend logic lives.** The repo has a FastAPI app in `apps/api`, and AGENTS.md says the backend owns business logic. The team product spec instead describes Next.js Route Handlers / Server Actions with Zod. Pick one and update AGENTS.md section 3. The rest of this list assumes FastAPI.
- [ ] **Database.** The team spec names Supabase PostgreSQL (plus Supabase Storage for images). Confirm, and decide whether FastAPI talks to it through SQLAlchemy/psycopg or the Supabase client.
- [ ] **Auth.** The team spec names Auth0, not Supabase Auth. Confirm, and decide how the web app passes the session to FastAPI (Auth0 access token verified by the API is the usual pattern).
- [ ] **AI provider.** The team spec names Google Gemini for listing drafts and matching.
- [ ] **Buy/sell scope.** The mock has both rent/borrow listings (`Listing`) and buy listings, deals and bundles (`mock-shop.ts`). Decide whether sale listings get wired for the demo or stay as a mockup.

## P0: core marketplace journey

### Foundation
- [ ] Add `.env.example` with every variable the API and web app need (`DATABASE_URL`, Auth0 settings, `GEMINI_API_KEY`, `NEXT_PUBLIC_API_URL`, ...). No secrets in `NEXT_PUBLIC_*`.
- [ ] Add config loading in `apps/api/app/core/` (pydantic-settings or plain env reads).
- [ ] Add a typed API client in `apps/web/src/lib/` and read the base URL from `NEXT_PUBLIC_API_URL`.
- [ ] Start `docs/api-contract.md` and keep it in step with FastAPI's OpenAPI output. Consider generating TS types from OpenAPI instead of hand-copying the types in `mock-data.ts`.

### Database
- [ ] Write migrations for `profiles`, `listings`, `listing_images`, `wanted_posts`, `rental_requests`, `deposits`. Use the shapes in `mock-data.ts` as the starting point (they were written to match the planned schema).
- [ ] UUID primary keys, foreign keys, indexes on `listings(category, availability_status)` and `rental_requests(listing_id, status)`.
- [ ] Store money as integer cents (AGENTS.md section 6.3). The mock uses whole-dollar numbers, so convert at the boundary.
- [ ] Seed script with the sample profiles, listings, wanted posts and requests, including at least one incompatible listing so matching visibly filters it out (AGENTS.md section 19.5).

### Auth
- [ ] Sign in and sign out in the web app. Wire the existing "Sign out" item in `site-header.tsx`.
- [ ] Verify the session or token on every protected API route. Derive the user from it, never from a client-sent ID.
- [ ] Create or update the `profiles` row on first sign-in.
- [ ] Replace `CURRENT_USER_ID` with the signed-in user everywhere it is used.

### Listings
- [ ] `GET /api/listings` with `q`, `category`, `price` and `all` filters, matching what `app/marketplace/page.tsx` filters in memory today.
- [ ] `GET /api/listings/{id}` for the listing page.
- [ ] `POST /api/listings` from `components/listings/listing-form.tsx`. Its submit currently only sets local `published` state.
- [ ] `GET /api/profiles/{id}` plus the owner's listings for `app/profile/[id]/page.tsx`.

### Wanted posts and matching
- [ ] `GET /api/wanted`, `GET /api/wanted/{id}`, `POST /api/wanted` for the wanted pages and `wanted-form.tsx`.
- [ ] `POST /api/matches` (or `GET /api/wanted/{id}/matches`): filter real listings by category, availability, price and dates first, then rank. Return `{listing_id, score, reason}` like `MatchSuggestion`, and drop any ID that is not in the database.
- [ ] Replace `mockMatches` in `components/wanted/match-list.tsx` and the canned extraction in `wanted-form.tsx`.
- [ ] A deterministic fallback (category + keyword) when the AI call fails, labelled as such in the UI.

### Rental requests
- [ ] `POST /api/rentals` from `components/requests/request-form.tsx`. It currently only sets `submitted`.
- [ ] `GET /api/rentals?role=borrower|owner` for `app/dashboard/requests/page.tsx` and the dashboard.
- [ ] `PATCH /api/rentals/{id}` for accept, reject, cancel, start and complete. `request-row.tsx` changes local state only today.
- [ ] Enforce on the server: transitions are only pending to accepted/rejected/cancelled, accepted to active, active to completed; only the owner accepts or rejects; only the borrower cancels; no requests on your own listing; no overlapping accepted or active bookings for one listing.
- [ ] pytest coverage for the state machine and the overlap check.

## P1: differentiators and sponsors

- [ ] **AI listing draft:** `POST /api/listings/draft` returns a suggested title, description, category and price. Validate the output; the user still reviews and edits before publishing. Replaces the canned response in `listing-form.tsx`.
- [ ] **Image upload:** wire the image picker in `listing-form.tsx` to storage and save rows in `listing_images`.
- [ ] **Solana Devnet deposit:** real wallet connection and a Devnet transfer in `components/deposits/deposit-demo.tsx`, a server check of the signature against a Devnet RPC, and a row in `deposits`. Describe it as a Devnet transfer, not escrow, unless a tested program exists (AGENTS.md section 9).
- [ ] Error, loading and empty states for every call that replaces sample data.
- [ ] Record each sponsor integration in `docs/sponsor-evidence.md` once it actually works.

## P2: later

- [ ] Wire buy listings, price drops and bundles (`/deals`, `/move-out`) if the buy/sell decision above says so.
- [ ] Semantic search with pgvector.
- [ ] Deploy (Vercel for web, a host for the API) and set up the custom domain.
