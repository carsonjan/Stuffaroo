# Vercel and Neon migration

The reported production path is [landing](https://stuffaroo-homepage.vercel.app/) → [marketplace](https://stuffaroo-web-puce.vercel.app/marketplace) → server-side `API_URL` → [FastAPI](https://stuffaroo-api-ashy.vercel.app) → Neon. Auth0 authenticates the Next.js app and the API verifies its access tokens. PostgreSQL full-text search is the default; Gemini and Vertex are disabled unless `ENABLE_GEMINI=true` is explicitly set. Full-text matching is lexical, not semantic.

The original migration plan used `stuffaroo.shop/app/*` through a cross-project rewrite. Production instead uses a direct link to the separate web hostname and an empty Next.js base path. Source still contains the old proxy, redirects and `/app/marketplace` fallback, and homepage `WEB_ORIGIN` remained set to the older team-scoped web hostname. Review these residual settings before removing them. The desired `stuffaroo.shop` landing domain, its DNS cutover and Vercel attachment have not been verified. The production settings below reflect the reported debugging session; they are not independently revalidated here. See the [executive summary](migration-executive-summary.md) for the chronology and deployment IDs.

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
| `apps/api` | FastAPI framework. `DATABASE_URL` = canonical Neon pooled TLS URL; `AUTH0_DOMAIN=carson-dev.ca.auth0.com`; `AUTH0_AUDIENCE=https://api.stuffaroo.dev`. Leave `ENABLE_GEMINI` unset or `false`. `DATABASE_DIRECT_URL` is needed only where migrations are run, not in the function. |
| `apps/web` | Next.js framework. `NEXT_PUBLIC_BASE_PATH` empty at build and runtime; `API_URL=https://stuffaroo-api-ashy.vercel.app`; `APP_BASE_URL=https://stuffaroo-web-puce.vercel.app`; `AUTH0_COOKIE_PATH=/`; `AUTH0_DOMAIN=carson-dev.ca.auth0.com`; `AUTH0_AUDIENCE=https://api.stuffaroo.dev`. Configure Auth0 client credentials and session secret securely. |
| `apps/homepage` | Vite/TanStack Start, normal `pnpm build`; Nitro selects its Vercel preset when `VERCEL` is set. `VITE_MARKETPLACE_URL=https://stuffaroo-web-puce.vercel.app/marketplace`. Existing non-landing Lovable routes still require their own Supabase configuration. |

The Neon pooled hostname is `ep-snowy-morning-artp5yeq-pooler.c-4.us-west-2.aws.neon.tech`. Use the exact Neon-provided connection string securely; do not duplicate `-pooler` or print credentials. The previous malformed hostname led to authentication failures and pool timeouts.

The current source still requires `WEB_ORIGIN` for a Vercel homepage build and emits the original `/app` proxy and legacy redirects. The reported production value points to an older team-scoped web hostname; it is residual and is not the direct landing link. Do not remove it without changing and verifying the source build and routes. Check any consumers of those routes before cleanup. Keep preview environments separate and explicitly configure their upstream and Auth0 callbacks if testing sign-in there.

## 3. Auth0 and DNS

The reported Auth0 tenant is `carson-dev.ca.auth0.com`, with Regular Web Application `stuffaroo-web` (client ID `DrPxJ8nKdfkYOMRC8GB1wFzaMNAhsMpX`). Its allowed callback URLs include `https://stuffaroo-web-puce.vercel.app/auth/callback`; allowed logout URLs and web origins include `https://stuffaroo-web-puce.vercel.app`. The API identifier is `https://api.stuffaroo.dev` in both web and API settings. User-delegated access uses per-app authorization, with `stuffaroo-web` explicitly authorized. Production uses `AUTH0_COOKIE_PATH=/`; a successful profile response alone does not prove a server-rendered session is visible.

The intended eventual custom domain `stuffaroo.shop` is for the landing page. Verify its Vercel project attachment, GoDaddy DNS and HTTPS certificate before declaring cutover. Follow the current Vercel domain instructions, and retain existing DNS and the old infrastructure until the new deployment, data, backup and rollback plan are verified. If a future design changes the marketplace origin, separately align its Auth0 callback, logout, web origins, `APP_BASE_URL` and cookie scope; a landing-domain change alone does not move the marketplace.

## 4. Verify, cut over, and roll back

- Test API `GET https://<api-project>.vercel.app/health`, `/api/listings`, `/api/wanted`, and `POST /api/matches` with a JSON search. Check matching dates, budget, category, unavailable listings, own listings and booking conflicts.
- Test landing SSR and assets, its direct marketplace link, marketplace navigation, forms, images, metadata and Auth0 on the actual production hostnames. Review residual `/app` and legacy rules separately. Create and retrieve a listing and complete a test rental lifecycle with authorized demo accounts.
- Check Vercel logs, Neon connection counts and startup latency after idle. A small lazy pool limits each API instance to two connections, but total connections scale with instances.
- If proceeding with the custom-domain cutover, switch DNS to Vercel only after verification. Monitor errors and preserve a backup and rollback window. If rollback is needed, restore the prior DNS records and direct traffic to the old deployment; reconcile any writes made after the database snapshot before switching databases again. Vercel deployments can also be rolled back independently.
- Only after the new deployment and backup are verified, manually retire Vultr, Tiger Cloud, old DNS and Nginx/Certbot as appropriate. No cancellation, DNS change or production database mutation is performed by this repository change.

## References

- [Vercel FastAPI](https://vercel.com/docs/frameworks/backend/fastapi), [Vercel rewrites](https://vercel.com/docs/project-configuration/vercel-json), [Nitro Vercel preset](https://nitro.build/deploy/providers/vercel)
- [Next.js basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath), [Auth0 SDK base path](https://github.com/auth0/nextjs-auth0#base-path), [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
