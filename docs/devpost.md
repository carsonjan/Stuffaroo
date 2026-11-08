# Devpost submission text

Source for https://devpost.com/software/marketplace-bjl2pu. Edit here, then paste into Devpost.

Tagline: Hop on the good deal: buy, sell, rent or borrow from a verified classmate. Stuffaroo keeps student gear on campus, so nobody buys what they'll use once or bins it at move-out.

## Inspiration

Students often need an expensive item for a short time: a camera for a film project, a projector for a club event, a kit for one course. Buying one is wasteful, and borrowing from a stranger on a general marketplace feels risky for both sides. At move-out, perfectly good stuff gets thrown away while next year's students buy it all again. We wanted to see whether verified student identity plus a refundable deposit could make borrowing from a classmate feel safe.

## What it does

Stuffaroo is a marketplace where students on one campus buy, sell, rent and borrow from each other: cameras, tents, textbooks, keyboards.

- **Ask in plain words.** Post a "wanted" like "something to film a club event this weekend". Stuffaroo matches it to listings on campus by what they're for, so it finds things a keyword search would miss, and says why each one matched. Anything booked on your dates, over budget, unavailable or your own is left out.
- **Browse.** Search listings by name, category and price.
- **List an item.** Describe it and set a price and availability. It shows up in search and matching straight away.
- **Request and hand off.** Borrowers request dates, the owner accepts or declines, and the two meet on campus. A dashboard follows each request from pending to accepted, handed over and returned. The server decides who can take each step and won't accept two bookings that overlap.
- **Verified sign-in.** Everyone signs in through Auth0, so every listing, request and acceptance belongs to a real student.
- **Deals and move-out.** Price drops, bundles and a countdown to move-out day, so students who are leaving can pass things on instead of throwing them out. These pages still use sample data.
- **Deposits.** Owners of pricier items can ask for a refundable deposit. The demo walks through a Solana Devnet deposit for a real accepted request (connect, sign, confirm). The transfer is simulated and labelled that way, and no wallet is contacted.

## How we built it

Stuffaroo is a Next.js web app talking to a FastAPI backend, with everything stored in one Tiger Cloud Postgres database. Students sign in with Auth0, and the API checks every token itself. Matching uses Gemini on Vertex AI: SQL filters narrow the listings, vector search ranks what's left, and a Gemini check removes poor fits. Both the web app and the API run on Vercel.

### Frontend

- **Next.js 16 (App Router):** renders the marketplace on the server and forwards the signed-in user's Auth0 token to our API, so the browser never calls the API or sees the token.
- **React 19 and TypeScript (strict):** the UI components and pages.
- **Tailwind CSS v4, shadcn/ui and Base UI:** styling and accessible components, on a design system we wrote ourselves.
- **Lucide:** icons.
- **TanStack Start, generated with Lovable:** the separate landing page that links into the marketplace.

### Backend

- **FastAPI on Python 3.12:** the API for listings, profiles, wanted posts, matching and rental requests. It enforces the request lifecycle (pending, accepted, active, completed) and who may make each change.
- **Pydantic:** validates every request and response.
- **psycopg:** talks to Postgres in plain SQL.
- **pytest:** 40+ tests covering matching, auth and the rental rules, run against the real Postgres and pgvectorscale image.

### Data and AI

- **Tiger Cloud (Tiger Data):** managed Postgres that holds everything: students, listings, bookings and embeddings.
- **pgvector and pgvectorscale:** store each listing's 768-dimension embedding and search them with a StreamingDiskANN index.
- **btree_gist:** an exclusion constraint that makes two overlapping accepted bookings impossible at the database level.
- **Gemini embeddings on Vertex AI (`gemini-embedding-001`):** turn listings and wanted posts into vectors, so matching works on meaning.
- **Gemini 3.5 Flash on Vertex AI:** reads the shortlist and removes listings that can't do the job. It can only remove listings, never add one.

### How a match is made

1. SQL filters drop listings that are unavailable, in the wrong category, over budget, booked on the requested dates or the requester's own.
2. The rest are ranked by vector similarity on the DiskANN index, and a cut-off tuned on real scores removes weak matches.
3. Gemini checks the shortlist.
4. If Gemini is unavailable, matching falls back to keyword ranking and the UI says so.

### Auth and hosting

- **Auth0:** student sign-in. FastAPI verifies each access token itself (signature, issuer, audience, expiry) and never trusts a user ID sent from the browser.
- **Vercel:** hosts both the web app and the API.

### Tooling

- **pnpm workspaces:** one repo for the web app, API and landing page.
- **Biome and Ruff:** lint and format TypeScript and Python.
- **Lefthook:** runs those checks before each commit.
- **GitHub Actions:** runs lint, type checks, tests and a production build on every PR.

## Challenges we ran into

- **Picking the match cut-off.** Similarity scores sat close together: listings that fit scored about 0.59 to 0.68 and unrelated ones about 0.52 to 0.58. We set the cut-off from real Gemini scores (at least 0.58, and within 0.07 of the best match) and saved those scores as a test.
- **Bad matches that passed the cut-off.** "Projector for a movie night" still matched a calculator and a keyboard. The Gemini relevance pass fixed that, but a search now takes about 3 seconds instead of 1. The faster lite model dropped listings that should have matched, so we kept the slower one.
- **Cloud setup on every laptop.** We moved Gemini to a Vertex AI service account so it runs on any teammate's machine and in Docker, and wrote `pnpm check:setup` to report what's connected and how to fix what isn't.
- **Swapping sample data for the real API.** We built the whole UI on sample data first, then replaced it one piece at a time across several stacked branches, which meant a lot of merging.

## Accomplishments that we're proud of

- **The full flow runs live.** Sign in, list an item, post a need, get AI matches, send a request, accept it, hand it over and get it back, all on real services.
- **The app is upfront about its AI.** Results say whether Gemini or the keyword fallback ranked them, and the "why this matches" text is built from real listing fields, not written by the model.
- **Rules live in the server and database.** Ownership, roles, request states and double bookings are checked there, and tests cover them.

## What we learned

- Vector search on its own gave us plausible candidates and some bad matches. Hard filters, a tuned cut-off and a small model check together worked much better than any one of them.
- Keeping relational data and vectors in the same Postgres let us filter and rank in one query.

## What's next for Stuffaroo

- Wire buy/sell listings, deals and move-out to real data.
- AI listing drafts and photo uploads.
- Real Devnet deposits from Phantom or Solflare, verified on the server, and then an escrow program so a deposit can be returned in full or in part.
- A damage-dispute process, with before and after photos for a human reviewer.
- A pilot with one campus group, then other campuses.

## Built with

Devpost allows at most 25 tags.

auth0, base-ui, biome, fastapi, gemini, github-actions, google-cloud, lovable, next.js, pgvector, pgvectorscale, pnpm, postgresql, pydantic, pytest, python, react, ruff, shadcn-ui, tailwindcss, tanstack, tiger-data, typescript, vercel, vertex-ai

## Try it out

- Live: https://stuffaroo-web.vercel.app/marketplace
- GitHub: https://github.com/carsonjan/Stuffaroo
