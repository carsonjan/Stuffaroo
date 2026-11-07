# Stuffaroo

## Setup

Install Node.js 24, pnpm 12.18.0, and uv with Python 3.12 or newer. From the repository root:

```sh
pnpm install
uv sync --directory apps/api
pnpm exec lefthook install
```

The workspace approves the `lefthook` installation script in `pnpm-workspace.yaml`; `sharp` and `unrs-resolver` remain denied as in the original web setup. Review other packages individually if pnpm requests approval.

Run both development servers with `pnpm dev`, or run `pnpm dev:web` and `pnpm dev:api` separately. Run `pnpm check` for lint, type checking, and tests. The API health endpoint is at `http://localhost:8000/health`.
