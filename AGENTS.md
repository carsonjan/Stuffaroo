
# AGENTS.md — Stuffaroo

## 1. Project Overview

**Stuffaroo** is a campus-focused second-hand marketplace built for HackCamp 2026.

Students can buy, sell, rent, and borrow items within their campus community. The platform aims to reduce waste, lower student expenses, and make temporary access to items easier.

Unlike a conventional marketplace, Stuffaroo emphasizes:

- **Buy and sell:** Students can list and discover second-hand items.
- **Rent and borrow:** Students can temporarily share items they do not need permanently.
- **Requests and matching:** Students can describe what they need, and AI helps match requests to available listings.
- **Trust and accountability:** Rental agreements and optional deposit mechanisms can make lending safer.

The project is being developed by three developers during a 24-hour hackathon.

**Primary objective:** Deliver a functional, polished, technically credible end-to-end demo that clearly addresses a meaningful student-community problem.

**Secondary objective:** Incorporate sponsor technologies where they provide genuine value, without sacrificing the main product or introducing excessive complexity.

This document provides instructions for AI coding agents and human contributors.

### 1.1 Current state (updated 2026-11-07)

Check this before assuming anything is wired up.

- **Frontend (`apps/web`):** a clickable mockup of every main screen (marketplace, listing detail, create listing, wanted posts and matches, deals, move-out, dashboard and requests, profiles, deposit demo). All data comes from `src/lib/mock-data.ts` and `src/lib/mock-shop.ts`. Forms and status buttons only change local React state.
- **Backend (`apps/api`):** FastAPI scaffold with `GET /health` only. No database, auth or AI integration exists yet.
- **Labelled mockups:** AI drafting, AI matching and the Solana deposit show canned or simulated results and say so in the UI. Keep those labels until the real integration replaces them (sections 2.5 and 19.3).
- **Signed-in user:** hard-coded as `CURRENT_USER_ID` in `mock-data.ts`.
- **Next step:** the backend wiring plan and its open decisions are in `docs/todo.md`. When you wire a screen to a real endpoint, remove the matching sample data and tick the item there.

---

## 2. Core Engineering Principles

Apply these principles in priority order.

### 2.1 Deliver working functionality first

- Prioritize an end-to-end working user journey over architectural completeness.
- Prefer the smallest correct implementation that demonstrates the intended feature.
- Ensure the application remains runnable throughout development.
- Implement a thin vertical slice before expanding functionality.
- Avoid complex infrastructure or abstractions unless they solve an immediate problem.
- Use established libraries rather than implementing commodity functionality from scratch.

For example, a complete request-to-listing matching flow is more valuable than a sophisticated matching engine with no usable frontend.

### 2.2 Maintain strict scope discipline

Classify proposed work into three categories:

**P0 — Demo-critical**
- Essential for the main user journey.
- Required for a core product differentiator.
- Necessary for the demo to run reliably.

**P1 — Valuable**
- Improves functionality, usability, technical credibility, or sponsor integration.
- Should be implemented only after the relevant P0 functionality works.

**P2 — Optional**
- Cosmetic polish, advanced configuration, edge cases, and convenience features.
- Can be deferred without undermining the demonstration.

Do not implement P2 features merely because they are easy or interesting.

Agents must not independently expand the product scope.

### 2.3 Prefer simplicity over abstraction

- Follow existing repository patterns.
- Do not introduce unnecessary design patterns.
- Avoid abstraction layers around one-off operations.
- Prefer explicit, readable code to highly generic frameworks.
- Do not add microservices or packages without a concrete need.
- Do not introduce background jobs, queues, or caching infrastructure unless required.
- Avoid premature performance optimizations.

A small amount of duplication is acceptable when removing it would introduce significant complexity.

### 2.4 Optimize for parallel development

Three developers and potentially several coding agents may work simultaneously.

- Minimize changes to shared files.
- Keep features self-contained.
- Establish API contracts before independently developing frontend and backend implementations.
- Make changes within the assigned feature or workstream.
- Avoid unrelated refactoring.
- Do not overwrite another contributor's work.
- Flag changes requiring cross-team coordination.

### 2.5 Keep the demo stable

At every major milestone, the application should support at least one meaningful working journey.

Prefer graceful degradation when optional integrations fail.

For example:
- If AI matching is unavailable, basic listing search should remain usable.
- If blockchain integration is unavailable, standard marketplace functionality should remain usable.
- If an external service fails, display an understandable error rather than crashing.

Fallbacks must never be represented as successful real transactions or successful AI calls when they are not.

---

## 3. Technology Stack

The following is the intended baseline architecture. Inspect the repository before making changes, as actual implementation decisions may evolve.

### Frontend

- Next.js with App Router
- React
- TypeScript with strict mode
- Tailwind CSS 4, with design tokens in `src/app/tokens.css` and the design system described in `apps/web/DESIGN.md`
- shadcn/ui components built on Base UI (`@base-ui/react`) in `src/components/ui/`
- Lucide icons
- pnpm package management

Use existing UI libraries and conventions already adopted by the repository.

Do not introduce additional component libraries without a clear reason.

### Backend

- Python
- FastAPI
- Pydantic
- uv for dependency management
- Ruff for linting and formatting
- pytest for testing

The backend owns business logic, persistent data access, AI integrations, and privileged external service operations.

### Data storage

Use the database and data-access approach configured in the repository.

Do not assume a particular database provider or ORM unless it is already selected.

Prefer straightforward relational data modeling for listings, users, requests, and rentals.

### AI

AI is intended primarily for semantic matching and other features that provide measurable value to marketplace users.

- Keep model access on the backend.
- Keep prompts and model-specific integrations isolated.
- Use structured outputs where applicable.
- Validate model-generated data before using it.
- Use deterministic filtering and ordinary application logic when sufficient.

### Optional integrations

Possible integrations include:

- Authentication services
- Managed database or vector-search providers
- Solana smart contracts for rental deposits
- Sponsor-specific infrastructure or developer tools

These integrations are optional until explicitly assigned or implemented.

Do not add integrations solely to increase the number of technologies listed in the submission.

---

## 4. Monorepo Structure

Expected repository structure:

```text
stuffaroo/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── routers/
│       │   ├── services/
│       │   ├── models/
│       │   └── core/
│       ├── tests/
│       └── pyproject.toml
│
├── packages/
│   └── shared/              # Create only when needed
│
├── contracts/                # Optional Solana/Anchor programs
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   ├── demo-script.md
│   └── sponsor-evidence.md
│
├── .github/
│   └── workflows/
├── .vscode/
├── AGENTS.md
├── README.md
├── .env.example
├── biome.json
├── lefthook.yml
├── pnpm-workspace.yaml
└── package.json
```

Not every directory must exist initially.

Create directories only when their contents are necessary.

### 4.1 Frontend structure

The frontend groups domain components by folder under `components/`:

```text
apps/web/src/
├── app/                 # routes and layouts
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── marketplace/     # listing cards, thumbnails, status badges, search prompt
│   ├── listings/        # listing form
│   ├── wanted/          # wanted posts and match list
│   ├── requests/        # rental request form and rows
│   ├── dashboard/
│   ├── deposits/        # Solana deposit demo
│   ├── shop/            # buy listings, deals, bundles, move-out
│   └── forms/           # shared form fields
└── lib/                 # sample data, formatting helpers, utils
```

Follow this layout. Put new domain components in the matching `components/<domain>/` folder rather than introducing a parallel `features/` tree.

Use:

- `app/` for routes, layouts, and route-level composition.
- `components/ui/` for generic UI primitives.
- `components/<domain>/` for domain-specific UI.
- `lib/` for shared infrastructure, API clients, and utilities. Put the API client here when the backend is wired.

Avoid putting substantial business logic directly into route components.

Avoid placing every component in a single global components directory.

### 4.2 Backend structure

Organize FastAPI code by responsibility:

```text
app/
├── main.py
├── routers/
├── services/
├── models/
└── core/
```

Responsibilities:

**Routers**
- Define HTTP endpoints.
- Validate incoming data.
- Invoke application services.
- Return documented responses.
- Keep business logic minimal.

**Services**
- Implement business operations.
- Coordinate persistence and external integrations.
- Implement listing matching, rental workflows, and other domain logic.

**Models**
- Define Pydantic request/response models and domain data structures.
- Avoid ambiguous or duplicated schema definitions.

**Core**
- Handle application configuration, shared infrastructure, database connections, and cross-cutting dependencies.

Introduce repositories or additional layers only if the application becomes complex enough to justify them.

### 4.3 Shared packages

Do not create a shared package unless functionality is used by multiple TypeScript packages.

For frontend/backend contracts, remember that Python types cannot be directly imported into TypeScript.

Prefer generating a TypeScript API client or types from FastAPI's OpenAPI specification when beneficial.

Avoid maintaining manually duplicated API models without a clear synchronization strategy.

### 4.4 Optional blockchain structure

If implementing Solana smart contracts:

```text
contracts/
├── programs/
├── tests/
├── Anchor.toml
└── Cargo.toml
```

Keep smart-contract logic separate from ordinary backend services.

Blockchain integration must not be a prerequisite for basic marketplace operations.

---

## 5. Coding Standards

### 5.1 General

- Write clear, maintainable, self-explanatory code.
- Prefer descriptive variable and function names.
- Follow existing naming conventions.
- Keep functions focused on one responsibility.
- Prefer composition to inheritance.
- Avoid unnecessary dependencies.
- Remove unused imports and dead code.
- Do not leave commented-out implementations.
- Avoid excessive comments that merely restate the code.

Comments should explain non-obvious reasoning, constraints, and important tradeoffs.

### 5.2 TypeScript

- Enable strict type checking.
- Prefer explicit domain types and interfaces.
- Avoid `any`; use `unknown` when appropriate.
- Validate untrusted external data at runtime.
- Prefer named exports for reusable modules, except where framework conventions require otherwise.
- Use `async`/`await` for asynchronous operations.
- Handle API failures explicitly.
- Use existing API clients rather than constructing ad hoc requests throughout the UI.

Do not suppress type errors merely to make a build pass.

Avoid `@ts-ignore` or unsafe type assertions unless justified.

### 5.3 React and Next.js

- Use functional components.
- Follow Next.js App Router conventions.
- Prefer Server Components when appropriate.
- Add `"use client"` only when client-side interactivity or browser APIs require it.
- Keep server-only secrets and privileged operations off the client.
- Avoid unnecessary global state.
- Keep component state close to where it is used.
- Extract reusable components only when reuse or clarity justifies it.

Every meaningful user action should have an appropriate loading, success, or error state.

Do not create decorative controls that appear functional but do nothing.

### 5.4 Python

- Use modern Python typing.
- Use Pydantic for external API validation.
- Prefer small, testable functions.
- Keep HTTP concerns out of core business logic.
- Use dependency injection where it simplifies testing or infrastructure integration.
- Use asynchronous functions when working with genuinely asynchronous I/O.

Avoid blocking network calls inside asynchronous request handlers.

Do not suppress exceptions silently.

### 5.5 Naming conventions

TypeScript:
- Components: `PascalCase`
- Types and interfaces: `PascalCase`
- Variables and functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE` when appropriate

Python:
- Variables and functions: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

Prefer domain-specific names such as `Listing`, `RentalRequest`, and `MatchResult` over vague names such as `Data`, `ItemInfo`, or `ObjectManager`.

---

## 6. API Contracts and Integration

Frontend and backend may be developed independently.

Stable API contracts are therefore essential.

### 6.1 Source of truth

Treat the actual backend API implementation and generated OpenAPI schema as authoritative.

Use `docs/api-contract.md` to record agreed interfaces before or during implementation.

If documentation and implementation disagree, identify and resolve the discrepancy rather than silently choosing one.

### 6.2 API conventions

Prefer REST-style endpoints with predictable naming.

Illustrative endpoints:

```text
GET    /api/listings
GET    /api/listings/{id}
POST   /api/listings

GET    /api/requests
POST   /api/requests

POST   /api/matches

POST   /api/rentals
GET    /api/rentals/{id}
```

These are examples, not instructions to implement every endpoint.

Use only the endpoints required by the current feature scope.

### 6.3 Responses

- Use consistent JSON naming conventions.
- Define response models explicitly.
- Use appropriate HTTP status codes.
- Return stable identifiers.
- Represent timestamps unambiguously, preferably ISO 8601 with timezone information.
- Represent monetary amounts safely, using integer minor units or a documented decimal representation.
- Never use floating-point arithmetic for actual financial settlement calculations.

### 6.4 Errors

Return structured and understandable errors.

For example:

```json
{
  "detail": "Listing not found"
}
```

If adopting a richer error schema, document it and use it consistently.

Do not expose internal stack traces, credentials, or infrastructure details through API responses.

### 6.5 Contract changes

When modifying an API interface:

1. Identify frontend and backend consumers.
2. Update the Pydantic models and API implementation.
3. Update API documentation or generated clients.
4. Update relevant callers.
5. Verify the affected integration.

Avoid breaking existing endpoints without coordination.

---

## 7. Marketplace Domain Rules

These rules guide data modeling and business logic.

### 7.1 Listings

A listing represents an item offered by a student.

Potential attributes include:

- Unique identifier
- Owner identifier
- Title
- Description
- Category
- Images
- Availability
- Transaction type
- Price or rental rate
- Condition
- Campus or approximate location
- Listing status
- Creation timestamp

Do not implement every possible attribute by default.

Use only the fields necessary for current workflows.

### 7.2 Transaction types

Distinguish between:

- **Sale:** Permanent transfer of ownership.
- **Rental:** Temporary use, potentially in exchange for payment.
- **Borrowing:** Temporary use, possibly without payment.

Do not assume rental and sale workflows have identical requirements.

### 7.3 Requests

A request represents something a student wants to obtain.

It may include:

- Requested item description
- Preferred transaction type
- Price or budget
- Desired dates
- Other relevant constraints

Matching should connect requests to compatible listings.

### 7.4 Rentals

When rental functionality is implemented, distinguish between:

- Item availability
- Rental request
- Owner acceptance
- Active rental
- Return/completion
- Cancellation or dispute

Implement only the states required by the demonstrated workflow.

Do not model an elaborate production dispute-resolution system unless specifically requested.

### 7.5 Data integrity

- Validate listing ownership before allowing modifications.
- Enforce transaction state transitions on the backend.
- Do not trust client-provided user IDs for authorization.
- Avoid duplicate or contradictory rental states.
- Ensure two requests cannot silently produce conflicting reservations when exclusive rental booking is supported.

For demo shortcuts, document any known limitations.


### 7.6 Product Differentiation and Scope Discipline

Stuffaroo is not intended to be a generic Facebook Marketplace clone.

Its central value proposition is helping students access, reuse, and
exchange physical items through campus-specific supply-demand matching,
including temporary borrowing/rental and potentially future-dated
availability (e.g., semester-end move-out handovers).

When implementing or proposing features, agents MUST:

1. **Protect the differentiator.**
   Prioritize the request-to-listing matching workflow over generic
   marketplace enhancements such as reviews, feeds, or elaborate profiles.

2. **Optimize for demonstrated value, not feature count.**
   A complete flow between two users is more valuable than several
   isolated features or attractive but nonfunctional UI screens.

3. **Make AI materially useful.**
   AI should interpret real user needs and help match them against
   available inventory. Do not introduce AI merely to generate decorative
   text, summaries, or superficial personalization.

4. **Keep constraints meaningful.**
   Matching must respect applicable hard constraints, including
   transaction type, price, and availability. Semantic similarity alone
   must not override incompatible requirements.

5. **Prioritize campus-specific use cases.**
   Favor implementation decisions that support temporary student needs,
   limited budgets, semester transitions, and reuse of existing items.

6. **Resist scope expansion.**
   Do not independently implement gamification, advanced messaging,
   reputation systems, complex recommendation infrastructure, or
   additional marketplaces unless explicitly assigned.

7. **Treat blockchain as optional infrastructure.**
   Smart-contract deposits may provide valuable functionality and
   sponsor-prize eligibility, but must never block the core marketplace
   workflow or require every demo user to own a crypto wallet.

When choosing between implementations of comparable effort, prefer the
one that makes Stuffaroo's unique value more visible to a first-time
user or hackathon judge.

---

## 8. AI Implementation Guidelines

AI features must solve a genuine product problem.

For Stuffaroo, the primary candidate is request-to-listing matching.

### 8.1 Architecture

Keep model calls and prompt construction inside the backend.

Do not call privileged AI APIs directly from frontend components.

Separate:

1. Input validation
2. Candidate retrieval
3. AI-assisted matching or ranking
4. Output validation
5. Response construction

Not every stage needs an LLM.

### 8.2 Matching behavior

Where possible, filter candidates using deterministic constraints before invoking an LLM.

Examples:
- Transaction type compatibility
- Availability
- Price range
- Campus
- Listing status

Use AI for semantic interpretation where keyword matching is insufficient.

For example, a request for "something to carry groceries on a bike" may reasonably match a listing for a bicycle pannier.

### 8.3 Structured output

Prefer structured model outputs containing documented fields such as:

```json
{
  "listing_id": "example-id",
  "score": 0.87,
  "reason": "The listing matches the requested use case."
}
```

This is an illustrative schema, not a mandated scoring system.

Do not present uncalibrated model scores as objective probabilities.

Validate returned listing IDs against actual database records.

An AI model must not invent listings that do not exist.

### 8.4 Reliability

- Configure reasonable timeouts.
- Handle provider errors.
- Handle malformed model output.
- Avoid unnecessary repeated model calls.
- Keep prompts concise.
- Minimize token usage where possible.

Prefer deterministic fallbacks if they preserve useful functionality.

If results are generated by a fallback algorithm, do not claim they were generated by an LLM.

### 8.5 Evaluation

Where practical, maintain a small test set of request/listing examples.

Include:
- Exact item matches
- Semantic matches
- Incompatible transaction types
- Unavailable items
- Unrelated listings

Tests should verify important behavior without relying on unstable, live LLM outputs.

Use mocked model responses for routine automated tests.

### 8.6 Privacy

Treat listing descriptions and user requests as untrusted input.

- Do not insert secrets into prompts.
- Do not send unnecessary personal information to external AI services.
- Do not allow instructions embedded in user-generated content to override system behavior.
- Validate AI-generated outputs before performing any application action.

---

## 9. Solana and Financial Integration

Solana-based rental deposits are an optional enhancement, not a dependency of the core marketplace.

If implemented, use the following guidelines.

### 9.1 Environment

- Prefer Solana Devnet for hackathon demonstrations.
- Use test tokens with no real financial value.
- Never use production private keys in source control.
- Never commit wallet seed phrases.
- Clearly distinguish simulated and real on-chain operations.

### 9.2 Deposit workflow

If implementing escrow or a deposit program, explicitly define:

- Who deposits funds
- What condition releases funds
- Who can initiate a release
- What happens when a rental is cancelled
- What happens in a dispute
- Which operations require wallet signatures

Do not claim that blockchain alone resolves real-world disagreements over item condition.

A smart contract can enforce programmed conditions, but it cannot independently verify physical damage.

### 9.3 Security

- Do not deploy experimental financial contracts to mainnet.
- Do not expose private keys through frontend bundles or public API responses.
- Validate transaction parameters.
- Avoid unnecessary authority over user funds.
- Document privileged roles and trust assumptions.

### 9.4 User experience

The marketplace should remain understandable to students unfamiliar with cryptocurrency.

Avoid exposing blockchain-specific complexity unless necessary.

Clearly label:
- Simulated transactions
- Devnet transactions
- Wallet connection requirements
- Deposit status

Do not simulate a successful on-chain transaction while presenting it as real.

---

## 10. UI/UX Guidelines

The product should feel like a coherent student marketplace, not a collection of disconnected hackathon features.

### 10.1 General design

- Use consistent spacing, typography, and colors.
- Maintain clear visual hierarchy.
- Prefer simple layouts over feature-dense dashboards.
- Make primary actions easy to find.
- Keep common workflows short.
- Prioritize polished core interactions.

### 10.2 Responsive design

Support desktop and mobile screen sizes.

At minimum, verify:
- Landing/listings page
- Listing detail page
- Listing creation
- Request creation
- Matching results
- Rental workflow, if implemented

Avoid horizontal overflow and inaccessible controls.

### 10.3 Accessibility

- Use semantic HTML.
- Label form controls.
- Support keyboard navigation.
- Provide visible focus indicators.
- Maintain readable contrast.
- Provide text alternatives for meaningful images.
- Do not communicate state using color alone.

### 10.4 User feedback

Provide clear states for:

- Loading
- Empty results
- Validation errors
- API failures
- Successful actions
- Unavailable functionality

Avoid nonfunctional buttons and misleading placeholder interactions.

### 10.5 Demo quality

Prioritize demo-visible quality over obscure visual refinements.

The interface should communicate the key differentiators immediately:

- Campus-specific reuse
- Renting and borrowing
- Request-to-listing matching

Avoid emphasizing sponsor logos or infrastructure details at the expense of the user experience.

---

## 11. Dependencies and Configuration

### 11.1 Package management

Use:
- `pnpm` for JavaScript/TypeScript
- `uv` for Python

Do not introduce npm, Yarn, pip requirements files, or Poetry as parallel dependency managers without an explicit decision.

Commit dependency lockfiles.

### 11.2 Dependencies

Before adding a dependency:

1. Check whether an existing dependency already solves the problem.
2. Consider whether the standard library is sufficient.
3. Prefer maintained, widely used packages.
4. Avoid dependencies requiring extensive setup for minor functionality.

Use consistent package versions within the monorepo.

### 11.3 Environment variables

All required environment variables must be documented in `.env.example`.

Never commit real credentials or tokens.

Examples of possible variables:

```dotenv
# Backend
DATABASE_URL=
AI_API_KEY=

# Frontend
NEXT_PUBLIC_API_URL=

# Optional integrations
SOLANA_RPC_URL=
```

These are examples. Use the actual variable names required by the implementation.

Next.js variables beginning with `NEXT_PUBLIC_` are exposed to the client.

Never use that prefix for secrets.

### 11.4 Local development

Prefer a simple local development workflow.

The root README should describe:
- Prerequisites
- Dependency installation
- Environment setup
- Database setup, if applicable
- Starting the frontend
- Starting the backend
- Running checks and tests

Do not introduce Docker solely for development convenience unless it materially simplifies required infrastructure.

---

## 12. Formatting, Linting, and Testing

### 12.1 Automated formatting

Use:
- Biome for JavaScript, TypeScript, JSON, and supported frontend files
- Ruff for Python

Follow existing configurations.

Do not manually impose formatting conventions that conflict with these tools.

### 12.2 Git hooks

Lefthook manages pre-commit checks.

Pre-commit hooks should remain fast and operate primarily on staged files.

Expected responsibilities:
- Formatting
- Basic lint checks
- Catching obvious mistakes

Do not add expensive integration tests or full builds to pre-commit hooks.

### 12.3 Tests

Prioritize tests for:
- Core business rules
- Request/listing matching
- Important validation
- Rental state transitions
- Financial or blockchain-related calculations
- Previously fixed bugs

Avoid spending substantial hackathon time achieving arbitrary coverage percentages.

Prefer a small set of meaningful tests.

### 12.4 Recommended commands

Use the repository's actual configured scripts.

Typical commands:

```bash
# Frontend lint/format
pnpm exec biome check .

# Frontend type checking
pnpm typecheck

# Backend lint
uv run --project apps/api ruff check apps/api

# Backend format check
uv run --project apps/api ruff format --check apps/api

# Backend tests
uv run --project apps/api pytest apps/api/tests
```

If commands differ in the actual repository, follow the repository configuration rather than blindly using these examples.

### 12.5 Validation before completion

Before claiming a task is complete:

1. Run relevant formatting and lint checks.
2. Run relevant type checks.
3. Run focused tests where practical.
4. Verify the affected workflow.
5. Check for accidental changes or generated files.

If validation cannot be performed, state what was not checked.

Never falsely claim tests passed.

---

## 13. Git and Collaboration

### 13.1 Branches

Use short-lived feature branches.

Suggested naming:

```text
feat/listing-creation
feat/ai-matching
feat/rental-flow
fix/listing-validation
chore/ci-setup
```

Prefer frequent integration into `main`.

Keep `main` runnable and demo-ready.

### 13.2 Commits

Write short, descriptive commit messages.

Examples:

```text
feat: add listing creation form
feat: implement request matching endpoint
fix: handle unavailable rental listings
chore: configure biome and lefthook
```

Conventional Commits are encouraged but should not require complicated enforcement during the hackathon.

### 13.3 Shared files

Exercise particular caution when changing:

```text
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
biome.json
lefthook.yml
AGENTS.md
.env.example
docs/api-contract.md
database migrations
CI workflows
```

These files may affect multiple workstreams.

Coordinate changes when necessary.

### 13.4 Git safety

- Do not force-push shared branches without explicit authorization.
- Do not reset or discard unrelated changes.
- Do not amend another contributor's commits.
- Do not commit secrets or local configuration files.
- Do not commit generated build artifacts.
- Do not create unnecessary commits on behalf of the user.

### 13.5 Concurrent coding agents

Assume other agents may be working in the repository.

Before editing:
- Inspect the target files.
- Check for relevant uncommitted changes.
- Understand existing interfaces.
- Avoid touching unrelated areas.

After editing:
- Review the diff.
- Confirm unrelated changes were preserved.
- Summarize affected files and interfaces.

Never use broad automated rewrites that could overwrite concurrent work without a clear reason.

---

## 14. Agent Task Execution Protocol

Every coding agent should follow this process.

### Step 1 — Understand the task

Identify:
- Requested behavior
- Relevant code locations
- Dependencies
- API or database implications
- Acceptance criteria

Do not begin with unrelated refactoring.

### Step 2 — Inspect existing implementations

Before writing code:

1. Read relevant source files.
2. Identify established conventions.
3. Read relevant documentation.
4. Check existing types and API models.
5. Identify reusable components and utilities.

Do not assume files or functions exist.

### Step 3 — Plan proportional to complexity

For a small localized change, implement directly.

For a larger change, briefly determine:
- Files to modify
- Interfaces to introduce or change
- Important edge cases
- Validation approach

Avoid elaborate planning documents for trivial work.

### Step 4 — Implement the smallest complete solution

Favor a working vertical slice.

When implementing a new feature:
- Connect it to the actual application.
- Handle meaningful errors.
- Avoid leaving important UI controls disconnected.
- Avoid placeholder business logic presented as finished functionality.

### Step 5 — Validate

Run relevant automated checks.

Verify behavior rather than only confirming files compile.

### Step 6 — Review scope

Check that:
- No unrelated files were modified.
- No unnecessary dependencies were added.
- No secrets were introduced.
- No existing feature was accidentally broken.
- Documentation is updated where necessary.

### Step 7 — Report completion

At the end of a task, report concisely:

**Implemented**
- What changed

**Files**
- Important files created or modified

**Validation**
- Checks or tests executed, including failures

**Remaining**
- Known issues, integration requirements, or blockers

Do not claim completion when required functionality remains disconnected.

---

## 15. Agent Autonomy and Escalation

Agents should independently make ordinary local implementation decisions.

Examples:
- Component organization
- Function extraction
- Input validation
- Error handling
- Choice of existing utilities
- Minor styling decisions

Do not interrupt development for trivial decisions.

However, do not independently make high-impact architectural changes.

Escalate or clearly flag decisions involving:
- Replacing a major framework
- Changing database providers
- Introducing new deployment infrastructure
- Modifying authentication architecture
- Introducing new paid external services
- Changing shared API contracts incompatibly
- Altering smart-contract authority or financial behavior
- Removing major functionality
- Performing destructive database migrations
- Changing the agreed demo scope

If blocked by an unresolved decision, complete independently useful work that does not depend on it.

When implementing a temporary workaround, document the limitation.

---

## 16. Security and Data Handling

Although this is a hackathon MVP, basic security rules still apply.

### 16.1 Secrets

Never:
- Commit API keys
- Commit database credentials
- Commit private wallet keys
- Embed secrets in frontend bundles
- Log authentication tokens
- Include secrets in screenshots or demo materials

### 16.2 Authentication and authorization

When authentication is implemented:
- Verify authentication on protected backend operations.
- Enforce ownership checks server-side.
- Do not trust client-provided user identity.
- Do not bypass authorization merely because a route is not linked from the UI.

### 16.3 Validation

Treat all external inputs as untrusted.

Validate:
- Request bodies
- Path parameters
- File uploads
- External API responses
- AI-generated content
- Blockchain transaction parameters

### 16.4 Data minimization

Collect only the data required for the demonstrated workflows.

Do not unnecessarily expose personal contact information, precise residential addresses, or financial information.

### 16.5 Demo data

Use fictional accounts and realistic sample listings.

Do not use real student personal information without permission.

Make demo-only or simulated workflows clear in documentation and presentation.

---

## 17. Sponsor Integration Guidelines

HackCamp has multiple sponsor prize categories.

Sponsor integration is valuable when it improves the product or demonstrates meaningful technical implementation.

### 17.1 Prioritization

Sponsor integration must not compromise core marketplace functionality.

Prefer:
1. Technologies that directly enable a core feature.
2. Integrations with minimal development overhead.
3. Technologies that support an impressive but credible demonstration.
4. Optional enhancements that can be isolated from the core application.

### 17.2 Implementation

For every sponsor integration, identify:

- The actual problem it solves
- Why the technology is appropriate
- Which feature uses it
- Where the implementation lives
- How it is demonstrated
- What evidence supports the prize submission

### 17.3 Evidence

Update `docs/sponsor-evidence.md` when implementing meaningful sponsor functionality.

Suggested record:

```markdown
## Sponsor: <Name>

### Technology used
<Specific product, API, or service>

### Problem solved
<Why it is useful>

### Implementation
<Relevant files and architecture>

### Demo
<How the functionality is shown>

### Evidence
<Code references, screenshots, logs, or results>

### Limitations
<Unfinished work or demo-only behavior>
```

Do not claim an integration is complete merely because:
- A dependency was installed.
- An API key was configured.
- A sponsor logo appears in the application.
- A service was mentioned in documentation.

The submission should accurately reflect functionality implemented.

---

## 18. Documentation Requirements

Documentation should remain concise and actionable.

### README.md

Must explain:
- What Stuffaroo does
- The student-community problem
- Key features
- Technical stack
- Local setup
- Environment variables
- How to run the application
- How to demonstrate the core workflow
- Relevant sponsor integrations

### docs/architecture.md

Describe:
- Major components
- Data flow
- External integrations
- Important architectural decisions

Use concise diagrams where useful.

### docs/api-contract.md

Document agreed API endpoints and important data structures.

Keep it aligned with the backend's OpenAPI schema.

### docs/demo-script.md

Record:
- Main demonstration sequence
- Required demo accounts/data
- Features being demonstrated
- Expected results
- Optional fallback flow

### docs/sponsor-evidence.md

Track implementation and evidence for sponsor prizes.

### docs/todo.md

The backend wiring plan, with open decisions and P0/P1/P2 items. Tick items as they land.

Avoid redundant documentation. Prefer updating existing documents.

### docs/entire

Read docs/entire/AGENTS.md for more info.

---

## 19. Demo Reliability

The final demonstration is a first-class engineering requirement.

### 19.1 Prepare deterministic demo data

Maintain enough sample data to demonstrate:
- Browsing listings
- Creating or viewing requests
- Matching a request to a relevant listing
- A rental or borrowing interaction, if implemented

Choose sample listings that make the matching behavior easy to understand.

### 19.2 Avoid fragile dependencies

Where practical:
- Use repeatable database seeding.
- Provide predictable initial states.
- Avoid long-running operations during the demo.
- Configure appropriate timeouts.
- Make integration failures understandable.

### 19.3 Real vs simulated functionality

Clearly distinguish:
- Live backend operations
- Real AI model calls
- Mocked responses
- Seeded database records
- Simulated transactions
- Actual Devnet transactions

A simulated flow can be acceptable for illustrating a concept, but must not be presented as a completed real integration.

### 19.4 Preserve the happy path

As the hackathon approaches completion:
- Avoid unnecessary large refactors.
- Avoid introducing unstable dependencies.
- Focus on fixing broken demo journeys.
- Verify frontend/backend integration.
- Ensure setup instructions work.

Do not trade a stable core product for a last-minute optional feature.

### 19.5 Demo-Driven Acceptance Criteria

HackCamp judges evaluate problem relevance, innovation, technical
implementation, design, and presentation. Historical recognized projects
suggest that a memorable, functioning core interaction is more valuable
than production-level completeness.

The team targets a demo of approximately four minutes.

#### Canonical Demo Scenario

The application should support a coherent scenario involving two students:

1. Student A creates a listing for an item, specifying relevant
   transaction terms and availability.
2. Student B describes an item they need using natural language,
   including relevant constraints such as budget or duration.
3. Stuffaroo interprets the request and searches actual persisted
   listings, rather than returning hardcoded match results.
4. The system identifies compatible listings and provides an
   understandable reason for each match.
5. Student B requests an exchange, rental, or borrowing arrangement.
6. Student A accepts, and the application reflects the updated
   transaction state.

Future-dated handovers and on-chain deposits may extend this scenario
if implemented, but they must not be prerequisites for the core flow.

#### Engineering Acceptance Criteria

For any feature contributing to this scenario:

- Prefer vertical slices that connect frontend, API, and persistence
  over isolated implementation of entire architectural layers.
- Demonstrate real state transitions, not merely screens that simulate
  successful actions.
- Include at least one incompatible listing in test/demo data to
  establish that matching respects constraints.
- Ensure AI-generated match explanations are grounded in actual
  listing attributes. Never fabricate listing details or compatibility.
- Keep seed/demo data reproducible and clearly distinguish it from
  hardcoded application behavior.
- Make critical flows resilient to failure of optional sponsor services.
- Prefer deterministic and testable behavior for essential operations.
- Verify the experience through the real application interface, not
  solely through unit tests or API responses.

#### Prioritization Under Time Pressure

If time is limited, prioritize in this order:

1. A working, end-to-end marketplace exchange scenario.
2. A meaningful, demonstrable AI matching capability.
3. Clear UI/UX and reliable demo execution.
4. One genuinely useful differentiating enhancement.
5. Optional sponsor integrations and secondary features.

Features that cannot be completed and demonstrated coherently should
be deferred rather than partially integrated into the critical path.

A feature is not considered demo-ready merely because its code exists.
It must be reachable, functional, and understandable in the deployed
or locally running application.

Agents should communicate when a proposed implementation adds
complexity without materially improving the core demo, technical
substance, or explicitly targeted sponsor eligibility.

---

## 20. Anti-Patterns to Avoid

Do not:

- Overengineer a 24-hour MVP.
- Add technologies solely for buzzword value.
- Create unnecessary microservices.
- Introduce generic abstractions without proven reuse.
- Duplicate business logic between frontend and backend.
- Put privileged API keys in frontend code.
- Use LLMs for simple deterministic operations.
- Trust AI-generated identifiers without validation.
- Implement visually impressive but nonfunctional UI.
- Silently replace real functionality with mocks.
- Hide exceptions without handling them.
- Suppress type errors to make checks pass.
- Add extensive low-value tests.
- Perform broad refactors unrelated to assigned work.
- Rewrite files that other agents are editing.
- Change agreed API schemas without coordination.
- Commit secrets, build artifacts, or local caches.
- Claim sponsor integrations that are not implemented.
- Prioritize optional polish while the core demo is broken.

---

## 21. Definition of Done

A feature is considered complete when:

1. It satisfies the assigned acceptance criteria.
2. It is connected to the appropriate application workflow.
3. Its important inputs and outputs are validated.
4. It handles expected errors appropriately.
5. It follows repository conventions.
6. Relevant lint and type checks pass.
7. Important business logic is tested where practical.
8. Shared contracts and documentation are updated if changed.
9. It does not break existing demo-critical functionality.
10. Any limitations are explicitly reported.

For integration features, merely implementing isolated code does not constitute completion.

For UI features, a visually complete screen with nonfunctional primary controls does not constitute completion.

For AI features, a prompt without working retrieval, validation, and frontend integration does not constitute completion.

---

## 22. Final Priorities

When deciding what to work on next, apply this ordering:

1. **Make the main marketplace journey work end-to-end.**
2. **Make the differentiated features demonstrable.**
3. **Ensure frontend/backend integration and data integrity.**
4. **Improve core UI/UX and demo reliability.**
5. **Complete valuable sponsor integrations.**
6. **Add focused tests and documentation.**
7. **Polish optional features if time remains.**

The project's success depends on demonstrating a real, coherent solution to a student-community problem.

Engineering quality matters, but it should support the product rather than become an end in itself.

**Default decision rule:** Choose the simplest maintainable implementation that delivers the requested behavior, preserves working functionality, and can be demonstrated reliably within the hackathon.

<!-- entire-agent:begin -->
Read .entire/agent-guide.md for this repository's workflow, source inspection, and verification guidance.
@.entire/agent-guide.md
<!-- entire-agent:end -->
