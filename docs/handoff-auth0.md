# Handoff: Auth0 authentication

**Status:** not started. Written 2026-11-07 for the agent who will implement auth.

## Decision (already made, don't revisit)

- Auth0 is the identity provider. Do not use Supabase Auth or another provider.
- It is integrated **in the Next.js app** (`apps/web`) with the Auth0 Next.js SDK, `@auth0/nextjs-auth0`.
- The FastAPI backend (`apps/api`) does not log users in. It verifies Auth0 access tokens forwarded by the Next.js server.

AGENTS.md section 3 (Authentication) and section 16.2 record the same rules.

## Where things stand

- No Auth0 package, config, env var or code exists anywhere in the repo.
- The UI fakes a signed-in student with `CURRENT_USER_ID = "u-maya"` in `apps/web/src/lib/mock-data.ts`.
- There is no database yet (see `docs/todo.md`), so there is no `profiles` table to write to.
- FastAPI only has `GET /health` in `apps/api/app/main.py`, with CORS allowing `http://localhost:3000`.

## Things to know before you start

- **Next.js 16 renamed middleware to Proxy.** The file is `apps/web/src/proxy.ts` and exports `proxy` (or a default). Auth0 docs that show `middleware.ts` need adapting. Next's own docs are in `apps/web/node_modules/next/dist/docs/` (see `01-app/01-getting-started/16-proxy.md` and `01-app/02-guides/authentication.md`). Read them; this Next version differs from older training data.
- **Check the installed SDK version's docs.** Function names below match `@auth0/nextjs-auth0` v4 (`Auth0Client`, `auth0.middleware`, `getSession`, `getAccessToken`, routes under `/auth/*`). Confirm against the version you install.
- **`cacheComponents: true` is on** in `apps/web/next.config.ts`. Reading the session reads cookies, which makes that part of the page dynamic. Keep session reads inside a `<Suspense>` boundary or in components that are already dynamic, and run `pnpm --dir apps/web build` to catch prerender errors.
- **`site-header.tsx` is a client component.** Get the user into it either by passing it down from a server layout or with the SDK's client hook. Don't import server-only SDK code into it.
- The repo uses **pnpm** (web) and **uv** (API). Add packages with `pnpm --dir apps/web add` and `uv add --directory apps/api`.

## Human setup needed (agent can't do this)

Someone with access to the Auth0 dashboard must create the tenant resources and put the values in `.env.local` files. Ask the user for these instead of inventing values. Never commit them.

1. A **Regular Web Application**:
   - Allowed Callback URLs: `http://localhost:3000/auth/callback` (add the deployed URL later)
   - Allowed Logout URLs: `http://localhost:3000` (add the deployed URL later)
2. An **API** with an identifier (the audience), for example `https://api.stuffaroo.dev`. The access token Next.js forwards to FastAPI is issued for this audience.

## What to build

### 1. Next.js (`apps/web`)

- Add `@auth0/nextjs-auth0`.
- `src/lib/auth0.ts`: create one `Auth0Client`, requesting the API audience so `getAccessToken()` returns a token FastAPI can verify.
- `src/proxy.ts`: hand requests to the SDK so `/auth/login`, `/auth/logout` and `/auth/callback` work. Optionally redirect signed-out users away from `/marketplace/dashboard`, `/marketplace/listings/new`, `/marketplace/wanted/new` and `/marketplace/deposits`. Treat this as a convenience only, not the security check.
- Re-check the session on the server in protected pages, route handlers and server actions.
- Header: show a "Sign in" link (`/auth/login`) when signed out. Show the account menu when signed in, using the session's name and picture. Point the existing "Sign out" item at `/auth/logout`. It currently links to `/`.
- Add a small server-side helper in `src/lib/` that attaches `Authorization: Bearer <access token>` when calling FastAPI. The backend wiring will build its API client on top of it.

### 2. FastAPI (`apps/api`)

- Add `pyjwt[crypto]` (or an equivalent maintained JWT library).
- `app/core/config.py`: read `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` from the environment.
- `app/core/auth.py`: a `get_current_user` dependency that reads the Bearer token and checks the signature using the tenant's JWKS (`https://<AUTH0_DOMAIN>/.well-known/jwks.json`, cached). It also checks the issuer (`https://<AUTH0_DOMAIN>/`), audience and expiry. Return the `sub` claim as the user ID. Respond `401` with `{"detail": "..."}` on any failure, without leaking token contents.
- A small protected route, such as `GET /api/me`, that returns the verified `sub`. This proves the round trip.
- pytest: tests for missing token, bad signature, wrong audience and expired token, plus a valid token. Mock the JWKS with a locally generated key. Do not call Auth0 in tests.

### 3. Environment variables

Create `.env.example` at the repo root (or extend it if the backend work added one) with empty values:

```dotenv
# apps/web (server-only, never NEXT_PUBLIC_)
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=          # random 32-byte hex, e.g. `openssl rand -hex 32`
APP_BASE_URL=http://localhost:3000
AUTH0_AUDIENCE=

# apps/api
AUTH0_DOMAIN=
AUTH0_AUDIENCE=
```

Match the names to what the installed SDK version actually reads. Document them in the README setup section.

## Out of scope for this handoff

- Creating the `profiles` table or upserting profiles. That waits on the database work in `docs/todo.md`. When the table exists, upsert by `auth0_user_id` (the `sub` claim) on first authenticated API call.
- Removing `CURRENT_USER_ID` from the pages. Its listing, dashboard and wanted-post comparisons need real data from the API first. Replace it as each page is wired, and note it in `docs/todo.md`.
- Roles, permissions, social connection setup, or email verification flows.

## Done when

- Signing in and out works locally against the real tenant, and the header reflects the state.
- A request from the Next.js server to `GET /api/me` with the forwarded token returns the user's `sub`.
- The same request without a token, or with a tampered one, gets `401`.
- `pnpm check` and `pnpm --dir apps/web build` pass.
- No secrets in git. `.env.example` and the README list every new variable.
- The Auth items in `docs/todo.md` are ticked, or annotated with what's left.

If the human hasn't supplied tenant credentials yet, build and test everything that doesn't need them (FastAPI verification with mocked JWKS, the UI states). Then report exactly which values are missing. Do not fake a successful sign-in.
