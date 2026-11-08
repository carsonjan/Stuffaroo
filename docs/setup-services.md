# Connecting the real services

Stuffaroo runs locally without any accounts: local Docker Postgres, keyword matching, and sign-in shown as "not configured". This guide switches on the real services. Run `pnpm check:setup` after each step; it reports what works and the exact fix for anything that doesn't, without printing secrets.

All values go in local files that git ignores: `apps/api/.env` and `apps/web/.env.local`. Never commit them.

## 1. Gemini (Vertex AI)

Gemini runs on Vertex AI in the `stuffaroo` Google Cloud project, billed to its credits. The API authenticates with the **`stuffaroo-api` service account** (role: Vertex AI User), so it works on any machine and in Docker without a personal Google login.

1. Get the key file **`apps/api/gcp-key.json`** privately from a teammate who has it. Never commit it or paste it in chat; git and Docker both ignore it.
2. In `apps/api/.env`:

   ```dotenv
   GOOGLE_GENAI_USE_VERTEXAI=true
   GOOGLE_CLOUD_PROJECT=stuffaroo
   GOOGLE_APPLICATION_CREDENTIALS=gcp-key.json
   ```

**Project owners:** to create a new key, for example after revoking a leaked one, run:

```sh
gcloud iam service-accounts keys create apps/api/gcp-key.json --iam-account stuffaroo-api@stuffaroo.iam.gserviceaccount.com
```

Delete old keys in the Cloud console: IAM & Admin → Service accounts → stuffaroo-api → Keys.

## 2. Tiger Cloud (database)

1. Sign in to the Tiger Cloud console (tigerdata.com) and create a service. Pick a region close to you. Any service type works, because the migration enables `vectorscale` (pgvector + DiskANN) and `btree_gist` itself.
2. Copy the service's connection string from its **Connect** panel. Use the direct connection; the pooled one also works.
3. In `apps/api/.env`, set it with TLS:

   ```dotenv
   DATABASE_URL=postgres://tsdbadmin:<password>@<host>:<port>/tsdb?sslmode=require
   ```

4. Create the schema, load the demo data and embed it:

   ```sh
   pnpm db:migrate
   pnpm db:seed
   pnpm db:embed
   pnpm check:setup
   ```

To go back to the local database, blank out `DATABASE_URL` and run `pnpm db:up`.

## 3. Auth0 (sign-in)

Follow [handoff-auth0.md](handoff-auth0.md). In short:

1. Create an **API** in the Auth0 dashboard. Its identifier is the audience, for example `https://api.stuffaroo.dev`.
2. Create a **Regular Web Application**:
   - Allowed Callback URLs: `http://localhost:3000/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
3. `cp apps/web/.env.example apps/web/.env.local` and fill in the Auth0 values. Generate `AUTH0_SECRET` with `openssl rand -hex 32`.
4. Put the same `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` in `apps/api/.env`.
5. Create the demo users `maya@demo.stuffaroo.dev` and `jordan@demo.stuffaroo.dev` (any password) and mark both **Email Verified**. They take over the seeded profiles on first sign-in.
6. Run `pnpm check:setup`, then `pnpm dev`, and sign in at http://localhost:3000/marketplace.

## For teammates: run the API in Docker

If it works on one machine but not another, the usual causes are:
- the other machine has no Tiger URL, because env files aren't shared through git
- Gemini was using the owner's personal Google login
- the values were put in the repo-root `.env`, which nothing reads

With Docker, you need only Docker and two files, both shared privately (DM or password manager, never git):

- **`apps/api/.env`**, with `DATABASE_URL` (the Tiger URL), the Gemini settings above, and `AUTH0_DOMAIN` / `AUTH0_AUDIENCE` once Auth0 is set up
- **`apps/api/gcp-key.json`**, the service-account key for Gemini

Then:

1. **Check everything from inside the container:**

   ```sh
   pnpm check:setup:docker
   ```

2. **Run the API** on http://localhost:8000:

   ```sh
   pnpm api:docker
   ```

3. **Run the website** in another terminal. This needs Node and pnpm, plus `apps/web/.env.local` for sign-in:

   ```sh
   pnpm install
   pnpm dev:web
   ```

The image never contains secrets. `.dockerignore` excludes `.env` and `gcp-key.json`; `scripts/api-docker.sh` passes the env file and mounts the key read-only when the container starts.

## Done when

`pnpm check:setup` prints "Everything is set up". Then:

- As Jordan, list an item.
- As Maya, find it from a wanted need and request it.
- As Jordan, accept the request and mark it handed over.
