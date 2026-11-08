# Stuffaroo

A campus marketplace where students buy, sell, rent and borrow things from each other. Built for HackCamp 2026.

Students buy things they only need for a week, and throw out perfectly good stuff at move-out. Stuffaroo keeps those items on campus: list what you own, post what you need, and let matching connect the two.

## Status

The frontend is a clickable mockup running on sample data. The backend is a FastAPI scaffold with only a health endpoint, and nothing is wired together yet. See [docs/todo.md](docs/todo.md) for the backend wiring plan.

| Area | State |
| --- | --- |
| Web app (`apps/web`) | All main screens built and responsive. Data comes from `src/lib/mock-data.ts` and `src/lib/mock-shop.ts` |
| API (`apps/api`) | FastAPI app with `GET /health` and CORS for `localhost:3000` |
| Database | Not set up |
| Auth | Not set up. The UI acts as one hard-coded student (`CURRENT_USER_ID`) |
| AI matching and drafting | Canned sample responses, labelled as mockup or sample output in the UI |
| Solana deposit | Simulated, labelled as simulated. No wallet is contacted |

Forms and buttons only change local state, and their success messages are labelled as mockups. Nothing is saved, and a page reload resets everything.

## Features in the mockup

- **Marketplace** (`/marketplace`): browse listings, search by name, filter by category and price.
- **Listing detail** (`/listings/[id]`): item info, owner, availability and a borrow/rent request form.
- **Create listing** (`/listings/new`): listing form with a "Draft with AI" helper.
- **Wanted posts** (`/wanted`, `/wanted/new`, `/wanted/[id]`): describe what you need and see matching listings with a reason for each match.
- **Deals and move-out** (`/deals`, `/move-out`): price drops, bundles and a countdown to move-out day.
- **Dashboard** (`/dashboard`, `/dashboard/requests`): your listings and incoming and outgoing rental requests, with accept, reject, cancel, "mark handed over" and "mark returned" actions.
- **Profiles** (`/profile/[id]`): public student profile with their listings.
- **Deposit demo** (`/deposits`): walkthrough of a Solana Devnet deposit transfer.

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

No environment variables are needed yet.

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

There is no live demo yet. Locally, start with `/` and follow the main journey:

1. Browse `/marketplace` and open a listing.
2. Post a need at `/wanted/new` and click "Find matches".
3. Open `/dashboard/requests` to accept or reject a request.
4. Walk through the deposit at `/deposits`.

Every result in this flow comes from sample data.
