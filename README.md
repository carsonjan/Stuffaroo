# Stuffaroo

A campus marketplace where students buy, sell, rent and borrow things from each other. Built for HackCamp 2026.

Students buy things they only need for a week, and throw out perfectly good stuff at move-out. Stuffaroo keeps those items on campus: list what you own, post what you need, and let matching connect the two.

## Status

The backend is being wired in chunks (see [docs/todo.md](docs/todo.md) and [docs/api-contract.md](docs/api-contract.md)). The rent and borrow journey runs on the real API and database: browsing, listings, profiles, wanted posts, matching, creating listings and wanted posts, rental requests and the dashboard. Sign-in goes through Auth0 and switches on once a tenant is configured (see [docs/handoff-auth0.md](docs/handoff-auth0.md)). The buy/deals/move-out sections and the Solana deposit demo still use sample or simulated data.

| Area | State |
| --- | --- |
| Web app (`apps/web`) | All main screens built and responsive. Rent/borrow screens read and write through the API; buy, deals and move-out sections use `src/lib/mock-shop.ts` |
| API (`apps/api`) | FastAPI: listings, profiles, wanted posts, matching, `/api/me`, and rental requests with a server-enforced lifecycle. See [docs/api-contract.md](docs/api-contract.md) |
| Database | Tiger Cloud Postgres (pgvector + pgvectorscale). Locally, the same image in Docker. Schema in `apps/api/migrations/`, fictional demo data in `apps/api/app/seed/` |
| Auth | Auth0 in Next.js; FastAPI verifies the forwarded access token. Off until Auth0 env vars are set |
| AI matching | Real: hard filters in SQL (availability, category, budget, booked dates, own listings), then Gemini embeddings ranked on Tiger's DiskANN index. Without Gemini configured it falls back to keyword ranking and the UI says so |
| AI listing drafts | Canned sample response, labelled as a mockup |
| Solana deposit | Uses your real accepted request and its deposit amount, but the transfer itself is simulated and labelled as such. No wallet is contacted |

Creating things and changing request status needs sign-in. With Auth0 not configured, those screens explain that instead of pretending to work.

## Features in the mockup

- **Home** (`/marketplace`): value proposition, featured listings, categories, deals and move-out highlights.
- **Browse** (`/marketplace/browse`): browse listings, search by name, filter by category and price.
- **Listing detail** (`/marketplace/listings/[id]`): item info, owner, availability and a borrow/rent request form.
- **Create listing** (`/marketplace/listings/new`): listing form with a "Draft with AI" helper.
- **Wanted posts** (`/marketplace/wanted`, `/marketplace/wanted/new`, `/marketplace/wanted/[id]`): describe what you need and see matching listings with a reason for each match.
- **Deals and move-out** (`/marketplace/deals`, `/marketplace/move-out`): price drops, bundles and a countdown to move-out day.
- **Dashboard** (`/marketplace/dashboard`, `/marketplace/dashboard/requests`): your listings and incoming and outgoing rental requests, with accept, reject, cancel, "mark handed over" and "mark returned" actions.
- **Profiles** (`/marketplace/profile/[id]`): public student profile with their listings.
- **Deposit demo** (`/marketplace/deposits`): walkthrough of a Solana Devnet deposit transfer.

## Tech stack

- **Web:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui components on Base UI, Lucide icons
- **API:** Python 3.12, FastAPI, Pydantic, uv, pytest
- **Tooling:** pnpm workspaces, Biome (TS/CSS/JSON), Ruff (Python), Lefthook pre-commit hooks

The visual design system (colours, type, spacing tokens) is documented in [apps/web/DESIGN.md](apps/web/DESIGN.md).

## Repository layout

```text
apps/
  web/            Next.js frontend
    src/app/          routes
    src/components/   UI, grouped by domain (marketplace, listings, wanted, requests, ...)
    src/lib/          API client, auth, categories, formatting, buy/deals sample data
  api/            FastAPI backend
    app/              main.py, routers/, services/, models/, core/
    tests/
docs/
  api-contract.md       API endpoints and rules
  todo.md               remaining work
  handoff-auth0.md      Auth0 setup and demo accounts
  sponsor-evidence.md   what each sponsor technology powers, and what's verified
```

## Setup

Install Node.js 24, pnpm 12.18.0, and uv with Python 3.12 or newer. From the repository root:

```sh
pnpm install
uv sync --directory apps/api
pnpm exec lefthook install
```

The workspace approves the `lefthook` installation script in `pnpm-workspace.yaml`; `sharp` and `unrs-resolver` remain denied as in the original web setup. Review other packages individually if pnpm requests approval.

### Database

The API uses Postgres with pgvector and pgvectorscale: a Tiger Cloud service, or the same image locally in Docker.

```sh
pnpm db:up        # start timescale/timescaledb-ha:pg17 on localhost:5433
pnpm db:migrate   # apply apps/api/migrations/*.sql
pnpm db:seed      # load the fictional demo students, listings and requests
pnpm db:embed     # embed listings with Gemini (needs Gemini set up in apps/api/.env)
```

To use Tiger Cloud instead, copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL` to the service URL (with `sslmode=require`), then run `pnpm db:migrate` and `pnpm db:seed`.

The web app reads `API_URL` (default `http://localhost:8000`). For sign-in, copy `apps/web/.env.example` to `apps/web/.env.local` and follow [docs/handoff-auth0.md](docs/handoff-auth0.md).

### Gemini (matching)

Embeddings run through **Vertex AI on the `stuffaroo` Google Cloud project**, billed to its credits. Use one of these:

**Your own Google login** (teammates added to the project in IAM with the *Agent Platform User* and *Service Usage Consumer* roles):

1. Install the gcloud CLI. On macOS:

   ```sh
   brew install --cask gcloud-cli
   ```

   On Linux or Windows, follow https://cloud.google.com/sdk/docs/install. Open a new terminal afterwards and check it with `gcloud --version`.

2. Sign in once, and bill your usage to the project:

   ```sh
   gcloud auth application-default login
   gcloud auth application-default set-quota-project stuffaroo
   ```

3. In `apps/api/.env`, set `GOOGLE_GENAI_USE_VERTEXAI=true` and `GOOGLE_CLOUD_PROJECT=stuffaroo`, and leave `GOOGLE_APPLICATION_CREDENTIALS` empty (`GOOGLE_CLOUD_LOCATION` defaults to `us-central1`).

**Or the service-account key:** put `gcp-key.json` (shared privately, never through git) in `apps/api/` and set `GOOGLE_APPLICATION_CREDENTIALS=gcp-key.json` in `apps/api/.env`. No gcloud needed. This is also what the Docker route uses.

Run `pnpm check:setup` to confirm, and `pnpm db:embed` if any listing has no embedding. A Google AI Studio key in `GEMINI_API_KEY` works instead. Without any of these, matching uses the labelled keyword fallback.

API tests create a throwaway `stuffaroo_test` database on the local server and skip if it isn't running. CI runs them against the same image.

## Running

With `apps/api/.env` (and `apps/web/.env.local` for sign-in) in place, from the repository root:

```sh
pnpm check:setup  # confirm the database, Gemini and Auth0 are connected
pnpm dev          # web on http://localhost:3000 and API on http://localhost:8000
```

Then open http://localhost:3000/marketplace (the root `/` is still the starter page).

```sh
pnpm dev:web      # web only
pnpm dev:api      # API only
pnpm api:docker   # API in Docker instead of uv; run `pnpm dev:web` alongside it
```

The API health endpoint is at `http://localhost:8000/health`.

### Connecting the real services

To switch on Tiger Cloud, Gemini and Auth0, follow [docs/setup-services.md](docs/setup-services.md). `pnpm check:setup` reports what is connected and how to fix anything that isn't. Teammates can run the API in Docker with `pnpm api:docker` (see the guide's "For teammates" section).

## Checks

```sh
pnpm check        # lint, type check and tests
```

`pnpm typecheck` runs `next typegen` first, so the route types (`PageProps`, `LayoutProps`) exist on a fresh checkout.

GitHub Actions (`.github/workflows/ci.yml`) runs `pnpm check` and a production build of the web app on every pull request and on pushes to `main`.

## Demo

There is no live demo yet. The app lives under `/marketplace` (the root `/` is still the starter page). Locally, with the database seeded and two demo Auth0 users set up (see [docs/handoff-auth0.md](docs/handoff-auth0.md)), for example Maya and Jordan:

1. As Jordan, list an item at `/marketplace/listings/new`.
2. As Maya, describe a need at `/marketplace/wanted/new` and click "Find matches". The results say whether they were ranked with Gemini embeddings or by keyword.
3. Open a matching listing and send a request.
4. As Jordan, accept it at `/marketplace/dashboard/requests`, then mark it handed over and returned.
5. Optionally walk through the simulated Devnet deposit at `/marketplace/deposits`.

Listings, people and requests come from the seeded fictional demo data plus whatever you create. The deposit step is simulated and labelled as such.
