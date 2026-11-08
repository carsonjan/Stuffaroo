# Stuffaroo

A campus marketplace where students buy, sell, rent and borrow things from each other. Built for HackCamp 2026.

Students buy things they only need for a week, and throw out perfectly good stuff at move-out. Stuffaroo keeps those items on campus: list what you own, post what you need, and let matching connect the two.

## Status

The backend is being wired in chunks (see [docs/todo.md](docs/todo.md) and [docs/api-contract.md](docs/api-contract.md)). Browsing, listing detail, profiles, wanted posts and matching now read from the database through the API. Sign-in, creating listings and requests, and the dashboard still run on sample data.

| Area | State |
| --- | --- |
| Web app (`apps/web`) | All main screens built and responsive. Data comes from `src/lib/mock-data.ts` and `src/lib/mock-shop.ts` |
| API (`apps/api`) | FastAPI with read endpoints for listings, profiles and wanted posts, and matching (`/api/matches`, `/api/wanted/{id}/matches`) |
| Database | Tiger Cloud Postgres (pgvector + pgvectorscale). Locally, the same image in Docker. Schema in `apps/api/migrations/`, fictional demo data in `apps/api/app/seed/` |
| Auth | Not set up. The UI acts as one hard-coded student (`CURRENT_USER_ID`) |
| AI matching | Real: hard filters in SQL (availability, category, budget, booked dates, own listings), then Gemini embeddings ranked on Tiger's DiskANN index. Without a Gemini key it falls back to keyword ranking and the UI says so |
| AI listing drafts | Canned sample response, labelled as a mockup |
| Solana deposit | Simulated, labelled as simulated. No wallet is contacted |

Forms and buttons only change local state, and their success messages are labelled as mockups. Nothing is saved, and a page reload resets everything.

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
    src/lib/          sample data and formatting helpers
  api/            FastAPI backend
    app/              main.py, routers/, services/, models/, core/
    tests/
docs/
  todo.md         backend wiring plan
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
pnpm db:embed     # embed listings with Gemini (needs GEMINI_API_KEY in apps/api/.env)
```

To use Tiger Cloud instead, copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL` to the service URL (with `sslmode=require`), then run `pnpm db:migrate` and `pnpm db:seed`.

The web app reads `API_URL` (default `http://localhost:8000`).

API tests create a throwaway `stuffaroo_test` database on the local server and skip if it isn't running. CI runs them against the same image.

## Running

```sh
pnpm dev          # web on http://localhost:3000 and API on http://localhost:8000
pnpm dev:web      # web only
pnpm dev:api      # API only
```

The API health endpoint is at `http://localhost:8000/health`.

## Checks

```sh
pnpm check        # lint, type check and tests
```

`pnpm typecheck` runs `next typegen` first, so the route types (`PageProps`, `LayoutProps`) exist on a fresh checkout.

GitHub Actions (`.github/workflows/ci.yml`) runs `pnpm check` and a production build of the web app on every pull request and on pushes to `main`.

## Demo

There is no live demo yet. The mockup lives under `/marketplace` (the root `/` is still the starter page). Locally, start at `/marketplace` and follow the main journey:

1. Browse `/marketplace/browse` and open a listing.
2. Post a need at `/marketplace/wanted/new` and click "Find matches".
3. Open `/marketplace/dashboard/requests` to accept or reject a request.
4. Walk through the deposit at `/marketplace/deposits`.

Every result in this flow comes from sample data.
