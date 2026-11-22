# CLAUDE.md — AI Commerce POS

Multi-tenant SaaS POS and AI Sales Agent platform for Myanmar SMEs.
Pilot industry: **Bag Shops**. Future: Eyewear Shops, Gold Shops.

## Project Rules

- This is a **multi-tenant SaaS** POS platform. Every tenant-owned record belongs to exactly one tenant.
- First pilot industry is **Bag Shops**. Do not build eyewear or gold features unless the task asks for them.
- Frontend (`apps/web`) and backend (`apps/api`) are **separate applications** in one pnpm monorepo.
- The backend is **one deployable application** (modular monolith).
- Backend business domains live in `apps/api/src/modules/<domain>/` with clear boundaries.
  Modules interact through each other's service layer, never by querying another module's tables directly.
- Do **not** introduce microservices, Redis, message queues, Kafka or Kubernetes without explicit approval.

## Engineering Rules

- TypeScript **strict mode** everywhere. Extend `tsconfig.base.json`.
- Validate all external input (HTTP bodies, params, query strings, env vars, sync payloads, AI tool arguments) with **Zod**.
- **Prisma is used only inside `apps/api`.** Never import Prisma from `apps/web` or `packages/shared`.
- Never expose secrets to the frontend. Every `VITE_*` variable is public.
- Enforce **tenant and branch authorization on the backend**. Take the tenant ID from the authenticated session, never from client input.
- Use **Decimal** for financial values (Prisma `Decimal` / MySQL `DECIMAL`). Never do money arithmetic with JavaScript floating-point numbers.
- Keep **stock movement records auditable**: record stock changes as movements; do not silently overwrite quantities.
- Frontend code must never access the database directly. All data goes through the REST API.
- Write tests (Vitest) for critical business logic: money, stock, tenant isolation, permissions.
- Avoid unnecessary infrastructure and dependencies. Justify each new dependency.

## Repository Layout

```
apps/web/            React + Vite + Tailwind (POS UI and back office)
apps/api/            Express 5 + Prisma (single deployable backend)
  src/modules/       business domain modules
  src/core/          config, db, errors, logger, middleware
  src/shared/        backend-internal helpers
  prisma/            schema and migrations
  tests/             integration tests
packages/shared/     Zod schemas, DTO types, pure helpers (no Node/Prisma/Express code)
docs/                PRD, architecture, database design, roadmap, ADRs
```

## Environment

- Package manager: **pnpm 10.33.0** (do not use npm or yarn).
- Node.js 24.
- Development database: local MySQL 9.3 on `127.0.0.1:3306`. Production target: verify **MySQL 8.4 LTS** compatibility.
- Never create, migrate, or modify databases unless the task explicitly asks for it.
- Never create real `.env` files or commit credentials. Only `.env.example` files are committed.

## Claude Code Workflow

Before implementing a task:

1. Inspect the relevant files.
2. Explain the proposed changes.
3. Identify potential risks.
4. Implement only the approved scope.
5. Run relevant checks (typecheck, lint, test).
6. Summarize modified files and test results.

Do not silently modify unrelated files. Ask before deleting or overwriting anything.
