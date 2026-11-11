# Stuffaroo: Migrating a Hackathon Application to Serverless Infrastructure

**Migration period:** November 2026

## 0. The Numbers

- Ran on Codex with GPT 6.1 Terra (high thinking), the agent spent:
    - 8.5 minutes implementing codebase migration
    - 23.5 minutes operating Vercel and Neon plugins to create, initialize, and verify the project
    - 2.5 minutes writing this executive summary document
- Around 30 minutes of manual code review, auth0 config, and verifying deployment
- Total tokens spent: 26% 5h quota on plus account, as of Nov 11, 2026.

## 1. Executive Overview

Stuffaroo is a campus-oriented marketplace built during HackCamp 2026 for students to buy, sell, borrow, and rent items. Its hackathon deployment combined a Vultr server, Docker Compose, Nginx, Tiger Cloud PostgreSQL, Auth0, and Gemini. That stack demonstrated the product, but a continuously running server, expiring credits, a database trial, and ongoing administration were a poor fit for a portfolio project expecting infrequent visits.

The migration retained the application frameworks and relational database model while deploying three independent Vercel projects and a Neon PostgreSQL database. PostgreSQL full-text ranking replaced Gemini as the default matching path, and the database constraint preventing overlapping accepted rentals was preserved. Existing Tiger data was copied to Neon, and all 57 API tests passed against an isolated Neon branch. The change aimed to reduce idle operating costs and administration; actual savings have not been measured.

The owner defined the constraints and chose to migrate existing data; ChatGPT helped shape the plan, and Codex inspected, implemented, tested, and provisioned within the authorized scope. The migration commit was merged into `main`. Subsequent production fixes were primarily external Vercel and Auth0 configuration changes and redeployments, so Git history alone does not capture the final configuration.

## 2. Architecture and Decisions

The architecture is **landing → marketplace → FastAPI → Neon**, with Auth0 and Google sign-in providing authentication. The landing page is [www.stuffaroo.shop](https://www.stuffaroo.shop), and the root domain is configured to redirect there. The marketplace uses [app.stuffaroo.shop/marketplace](https://app.stuffaroo.shop/marketplace), with its [Auth0 callback](https://app.stuffaroo.shop/auth/callback) on the same host. The API remains on its Vercel production hostname. Landing, marketplace, and API are separate Vercel projects.

The original plan routed the marketplace through an `/app` rewrite; the current design links directly to its own hostname and uses no Next.js base path. Some original proxy configuration remains in the source and needs review. Retaining PostgreSQL avoided a data-layer rewrite, while replacing the Tiger-specific index improved portability. Full-text search removes the Gemini dependency but cannot reproduce semantic matches that share no search terms.

## 3. Production Lessons

Production debugging exposed several independent integration issues. Auth0 required a consistent callback and API audience, explicit authorization for the web application, and correct session-cookie path scoping. A protected Vercel alias initially blocked web-to-API requests, while an incorrectly constructed pooled database hostname prevented connections to Neon. Correcting those settings restored the authenticated application on the earlier Vercel-hosted domain, as confirmed by the owner.

The custom domains were subsequently attached and their DNS and Auth0 settings updated. Vercel reports the landing and marketplace deployments READY and associated with their respective custom domains. A READY deployment alone does not prove redirects, authentication, or database-backed workflows function end to end; those flows on the custom domains remain to be verified.

## 4. Verification and Remaining Work

The migration tests passed on an isolated Neon branch, and table counts matched the source snapshot at copy time. Counts do not prove complete data equivalence or account for later writes. The owner confirmed sign-in and authenticated application behavior before the custom-domain change; the new domain's complete sign-in and application flow has not been verified here.

Remaining work includes testing the root redirect and custom-domain flows, reviewing obsolete proxy rules and deployment protection, reconciling any later source-database writes, and confirming backups and rollback before retiring the old infrastructure. For migration and rollback procedures, see the [deployment guide](deployment-vercel-neon.md).
