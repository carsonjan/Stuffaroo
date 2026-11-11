# Vercel and Neon migration

The intended path is `stuffaroo.shop` → TanStack Start homepage → `/app/*` cross-project rewrite → Next.js → server-side `API_URL` → FastAPI → Neon. Auth0 authenticates the Next.js app and the API verifies its access tokens. PostgreSQL full-text search is the default; Gemini and Vertex are disabled unless `ENABLE_GEMINI=true` is explicitly set. Full-text matching is lexical, not semantic.

## 1. Create and prepare Neon

Create a Neon Free project and database in a region near Vercel. Obtain its **pooled** connection URL for the API and its **direct** URL for schema work. Both must require TLS. Never commit either URL. The database needs `vector` and `btree_gist`; migration 001 creates them. Neon must permit extension creation by the migration role.

For a new, empty demo database, run locally from the repository root with the direct URL in your shell (avoid committing an env file):

```sh
export DATABASE_URL='<direct Neon connection URL>'
pnpm db:migrate
pnpm db:seed
```

The seed uses stable IDs and `ON CONFLICT DO NOTHING`; it does not clear existing records. You can instead set `DATABASE_DIRECT_URL` for migrations and `DATABASE_URL` for requests. Local `pnpm db:up` uses pgvector PostgreSQL 17; an existing `stuffaroo-db` container is not replaced automatically.

To retain Tiger data, first take and verify a backup. Create the new Neon database, apply migrations to the **empty** database, then use a data-only dump and restore of the application tables (`profiles`, `listings`, `listing_images`, `wanted_posts`, `rental_requests`, `deposits`) with compatible PostgreSQL client tools. Do not restore Tiger's extensions, DiskANN index, or `schema_migrations`. For example, using separate direct URLs held in environment variables:

```sh
pg_dump "$TIGER_DIRECT_URL" --data-only --no-owner --no-privileges \
  -t profiles -t listings -t listing_images -t wanted_posts -t rental_requests -t deposits -Fc -f stuffaroo-data.dump
pg_restore --exit-on-error --data-only --no-owner --no-privileges -d "$NEON_DIRECT_URL" stuffaroo-data.dump
```

The dump contains private user data: protect and delete it after verification. Freeze old writes or take a final consistent snapshot before cutover; a one-time copy does not synchronize later changes. Compare row counts per table, check representative records and references, and confirm `rental_requests_no_overlap` exists in `pg_constraint`. Test a conflicting accepted booking only inside a transaction that is rolled back. The existing seed has fictional accounts and should be used only if real data is not needed. Do not run the test suite against a production database: its fixtures create and drop `stuffaroo_test`.

## 2. Create Vercel projects

Connect the same repository three times; set each project root directory as follows. Deploy API first, web second, homepage last. Set secrets in Vercel project settings, never in git. The FastAPI project uses `pyproject.toml`'s ASGI app entrypoint. No migrations run during requests.

| Project root | Configuration |
| --- | --- |
| `apps/api` | FastAPI framework. `DATABASE_URL` = Neon pooled URL; `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` = existing values. Leave `ENABLE_GEMINI` unset or `false`. `DATABASE_DIRECT_URL` is needed only where migrations are run, not in the function. |
| `apps/web` | Next.js framework. `NEXT_PUBLIC_BASE_PATH=/app` at build and runtime; `API_URL=https://<api-project>.vercel.app` (no trailing path); `APP_BASE_URL=https://stuffaroo.shop`; `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `AUTH0_AUDIENCE` = existing Auth0 values. `AUTH0_SECRET` is a 32-byte hex session secret. |
| `apps/homepage` | Vite/TanStack Start, normal `pnpm build`; Nitro selects its Vercel preset when `VERCEL` is set. Set `WEB_ORIGIN=https://<web-project>.vercel.app` to the stable production web origin. Set `VITE_MARKETPLACE_URL=/app/marketplace` only if overriding the default. Existing non-landing Lovable routes still require their own Supabase configuration; see their existing integration settings. |

Set `WEB_ORIGIN` before building the homepage. Nitro emits the cross-project rewrite and legacy redirects into the Vercel build output; a missing or invalid origin fails the Vercel build. Ensure deployment protection allows the homepage rewrite to reach that hostname; a protected upstream will return an authentication page rather than the application. The rewrite preserves `/app` and the browser's public hostname. `/marketplace/*` and `/auth/*` redirect to their new `/app` locations; the homepage's former paths with those names are therefore intentionally shadowed on this public domain. Keep preview environments separate and explicitly configure their upstream and Auth0 callback if testing sign-in there.

Verify that Vercel applies Nitro's generated redirect and rewrite rules before the server function route: request both `/app` and `/app/marketplace`, assets under `/app/_next/`, legacy URLs, and `/` from the actual deployment. The local Nitro build alone does not verify Vercel's route merging.

## 3. Auth0 and DNS

In the existing Auth0 Regular Web Application settings, add `https://stuffaroo.shop/app/auth/callback` to **Allowed Callback URLs**, and `https://stuffaroo.shop` to **Allowed Logout URLs**. Keep existing URLs during transition; add `https://stuffaroo.shop` to Allowed Web Origins if the tenant requires it. Keep the existing API identifier as `AUTH0_AUDIENCE` in both projects. The SDK uses root `APP_BASE_URL` plus `NEXT_PUBLIC_BASE_PATH`; do not put `/app` in `APP_BASE_URL`. Test login, callback, refresh, logout, return paths, cookie scope and a protected write through the public domain; a direct `.vercel.app` test cannot prove proxy behavior.

Add `stuffaroo.shop` to the homepage Vercel project. Follow Vercel's exact DNS instructions in its domain settings (provider-specific values can change); leave existing DNS in place until the new deployment is ready. Verify the domain and HTTPS certificate after cutover. Keep the old Vultr host and its database intact until testing and any final data copy are complete.

## 4. Verify, cut over, and roll back

- Test API `GET https://<api-project>.vercel.app/health`, `/api/listings`, `/api/wanted`, and `POST /api/matches` with a JSON search. Check matching dates, budget, category, unavailable listings, own listings and booking conflicts.
- Test homepage SSR and assets, `/app` redirect, navigation, forms, images, metadata, legacy redirects and Auth0 through the public domain. Create and retrieve a listing and complete a test rental lifecycle with authorized demo accounts.
- Check Vercel logs, Neon connection counts and startup latency after idle. A small lazy pool limits each API instance to two connections, but total connections scale with instances.
- After verification, switch DNS to Vercel. Monitor errors and preserve a backup and rollback window. If rollback is needed, restore the prior DNS records and direct traffic to the old deployment; reconcile any writes made after the database snapshot before switching databases again. Vercel deployments can also be rolled back independently.
- Only after the new deployment and backup are verified, manually retire Vultr, Tiger Cloud, old DNS and Nginx/Certbot as appropriate. No cancellation, DNS change or production database mutation is performed by this repository change.

## References

- [Vercel FastAPI](https://vercel.com/docs/frameworks/backend/fastapi), [Vercel rewrites](https://vercel.com/docs/project-configuration/vercel-json), [Nitro Vercel preset](https://nitro.build/deploy/providers/vercel)
- [Next.js basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath), [Auth0 SDK base path](https://github.com/auth0/nextjs-auth0#base-path), [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
