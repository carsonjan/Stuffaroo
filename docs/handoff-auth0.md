# Auth0 setup

**Status:** implemented in code (chunk 3). Needs an Auth0 tenant to switch on. Until the env vars below are set, the app runs signed-out and the header says "Sign-in not configured".

## How it works

- **Next.js owns sign-in** with `@auth0/nextjs-auth0` v4.
  - `src/lib/auth0.ts` creates the client lazily, and only when every Auth0 env var is set.
  - `src/proxy.ts` (Next 16's replacement for middleware) mounts `/auth/login`, `/auth/logout` and `/auth/callback`, and keeps the session cookie rolling.
- **The Next.js server forwards the access token.** `src/lib/api.ts` calls FastAPI with `Authorization: Bearer <access token>` when a call needs auth. The browser never talks to the API and never sees the token.
- **FastAPI verifies every token itself** (`apps/api/app/core/auth.py`).
  - It checks the RS256 signature against the tenant's JWKS, plus issuer, audience and expiry. Then it maps `sub` to a profile.
  - Client-sent user IDs are never trusted.
  - If `AUTH0_DOMAIN` or `AUTH0_AUDIENCE` is missing, protected endpoints return 503.
- **Profiles are created on first sign-in** from Auth0's `/userinfo`.
  - If a seeded demo profile has the same email, and Auth0 says that email is verified, the login takes over that profile instead. An unverified email never links.
- **The page header** reads the viewer per request (`src/lib/viewer.ts`) and shows one of: "Sign in", the account menu (Dashboard, Deposits, Public profile, Sign out), or "Sign-in not configured".

## Setup (needs a person with Auth0 dashboard access)

1. **Create an API.** Dashboard → Applications → APIs → Create API.
   - Identifier (the audience): for example `https://api.stuffaroo.dev`.
   - Signing algorithm: RS256.
2. **Create an application.** Applications → Create Application → Regular Web Application. In its settings:
   - Allowed Callback URLs: `http://localhost:3000/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Add the deployed URLs later.
3. **Web env:** copy `apps/web/.env.example` to `apps/web/.env.local` and fill in:
   - `AUTH0_DOMAIN`: the tenant domain, for example `your-tenant.us.auth0.com` (no `https://`)
   - `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`: from the application
   - `AUTH0_SECRET`: from `openssl rand -hex 32`
   - `APP_BASE_URL`: `http://localhost:3000`
   - `AUTH0_AUDIENCE`: the API identifier from step 1
4. **API env:** in `apps/api/.env`, set `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` to the same values.
5. Restart `pnpm dev`.

## Demo accounts

The seeded students have emails like `maya@demo.stuffaroo.dev` (see `apps/api/app/seed/demo_data.json`: `u-maya` becomes `maya@…`). To sign in as one:

1. Dashboard → User Management → Users → Create User, on the Username-Password database connection, with that email and any password.
2. Open the user and set **Email Verified** to true. Linking requires a verified email.
3. Sign in at `/auth/login` with that email. The first API call links the login to the seeded profile, with its listings, wanted posts and requests.

Use two accounts, for example Maya and Jordan, to demo both sides of a rental.

## Optional: students only

Auth0 can restrict sign-in to students with a Post-Login Action. For example, deny when `event.user.email_verified` is false, or when the email isn't on the school's domain. This lives in the Auth0 dashboard and isn't in the repo. Add it and note it here if the demo needs it.

## Verified so far

- API tests (`apps/api/tests/test_auth.py`) cover: config missing (503), missing or malformed header (401), wrong signature, wrong audience, expired and garbage tokens (401), one profile per login, linking by verified email, and an unverified email never linking.
- End to end without a tenant, using a locally signed token in a real encrypted SDK session cookie: the header showed the account menu, the API linked the seeded profile, and that user's own listing showed "You can't request your own item".
- **Not yet tested against a real Auth0 tenant**, so the login redirect, the callback and the `/userinfo` call are unverified.
