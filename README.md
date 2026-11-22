# AI Commerce POS

A multi-tenant SaaS POS and AI Sales Agent platform for Myanmar SMEs.

- **Pilot industry:** Bag Shops
- **Future industries:** Eyewear Shops, Gold Shops

> **Status: backend foundation in progress (Phase 1).**
>
> **Implemented:** pnpm monorepo, shared schema package, Express 5 API skeleton with
> environment validation, centralized error handling, 404 handling, `GET /health`,
> Vitest + Supertest tests, and a tsdown production build.
>
> **Not implemented yet:** database (Prisma/MySQL), authentication, multi-tenancy,
> business modules (catalog, inventory, sales, …), frontend app, offline POS, AI Sales Agent.

## Technology Stack

| Layer    | Technology                                                    | Status         |
| -------- | ------------------------------------------------------------- | -------------- |
| Backend  | Node.js 24, Express 5, TypeScript 6, Zod 4                    | ✅ In use      |
| Build    | tsx (dev), tsdown (production bundle)                         | ✅ In use      |
| Testing  | Vitest 5, Supertest                                           | ✅ In use      |
| Shared   | `@ai-commerce-pos/shared` (Zod schemas, types), pnpm catalogs | ✅ In use      |
| Database | MySQL (dev: local 9.3; production target: 8.4 LTS), Prisma    | ⏳ Not started |
| Frontend | React, Vite, Tailwind CSS, TanStack Query                     | ⏳ Not started |
| Offline  | IndexedDB-based PWA POS                                       | ⏳ Future      |

Dependency versions are pinned once in the `catalog:` section of `pnpm-workspace.yaml`.
Packages reference them as `"catalog:"`, so every workspace uses the same version.
`minimumReleaseAge` (7 days) stops pnpm from installing packages published less than a week ago.

## Repository Structure

```
ai-commerce-pos/
├── apps/
│   ├── api/                          Express backend (single deployable app)
│   │   ├── src/
│   │   │   ├── app.ts                createApp(): builds the Express app, never listens
│   │   │   ├── server.ts             entry point: validates env, starts HTTP server, graceful shutdown
│   │   │   ├── core/
│   │   │   │   ├── config/env.ts     Zod-validated environment variables
│   │   │   │   ├── errors/           AppError + central error handler
│   │   │   │   └── middleware/       404 handler
│   │   │   ├── modules/
│   │   │   │   └── health/           GET /health
│   │   │   └── shared/               backend-only helpers (empty)
│   │   ├── prisma/                   reserved for Prisma (empty)
│   │   ├── tests/                    integration tests (Supertest)
│   │   ├── tsdown.config.ts          production bundle config
│   │   └── vitest.config.ts
│   └── web/                          React frontend (folders only, not implemented)
├── packages/
│   └── shared/                       @ai-commerce-pos/shared
│       └── src/schemas/              HealthResponse, ApiErrorResponse, ApiErrorCode
├── docs/adr/                         Architecture Decision Records (empty)
├── CLAUDE.md                         rules for AI coding assistants
├── pnpm-workspace.yaml               workspace packages, version catalog, release-age policy
└── tsconfig.base.json                shared strict TypeScript settings
```

Folders without real files contain a `.gitkeep` so Git tracks them. Delete it when the folder gets real files.

**Shared package note:** `@ai-commerce-pos/shared` exports TypeScript source directly (no build step).
tsx and Vitest compile it on the fly. The API's tsdown build **bundles it into `dist/server.js`**
(`deps.alwaysBundle`), because Node.js cannot run TypeScript from `node_modules`.

## Prerequisites

- **Node.js ≥ 24.11, < 25** (see `.nvmrc`). Required by tsdown. Use the latest 24.x patch release.
- **pnpm 10.33.0**
- **Git**
- **MySQL** _(not needed yet; required once Prisma is added)_

### Installing pnpm

Option A, using Corepack (ships with Node.js):

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

Option B, using npm:

```bash
npm install -g pnpm@10.33.0
```

Check it with `pnpm -v` (expected: `10.33.0`).

## Getting Started

```bash
pnpm install          # install all workspace dependencies (uses pnpm-lock.yaml)
pnpm dev              # start the API in watch mode on http://localhost:4000
```

Then check the API:

```bash
curl http://localhost:4000/health
```

**No `.env` file is needed to run the API today.** Every variable it currently reads has a safe
development default. If `apps/api/.env` exists, the `dev` and `start` scripts load it
automatically (Node.js `--env-file-if-exists`).

> During install, pnpm may warn `Ignored build scripts: esbuild`. This is expected:
> pnpm 10 blocks dependency install scripts by default, and esbuild (used by tsx) works without it.

## Environment Setup

Copy the templates and fill in real values locally (optional for now):

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

| File            | Contains                                        |
| --------------- | ----------------------------------------------- |
| `apps/api/.env` | Server secrets: database URL, JWT secrets, CORS |
| `apps/web/.env` | Public browser config only (`VITE_*` variables) |

Variables the API validates today (`apps/api/src/core/config/env.ts`):

| Variable      | Default                 | Used for                                      |
| ------------- | ----------------------- | --------------------------------------------- |
| `NODE_ENV`    | `development`           | Hides internal error messages in `production` |
| `PORT`        | `4000`                  | HTTP port                                     |
| `LOG_LEVEL`   | `info`                  | Validated; structured logger not added yet    |
| `CORS_ORIGIN` | `http://localhost:5173` | Validated; CORS middleware not added yet      |

Invalid values stop the server at startup with a readable error. `DATABASE_URL` and `JWT_*`
appear in `.env.example` but are **not read yet**. They will be validated when Prisma and auth are added.

**Every `VITE_*` variable is bundled into public JavaScript. Never put secrets in `apps/web/.env`.**

## Scripts

### Root (`package.json`)

Root scripts run the matching script in every workspace package that defines it
(`pnpm --recursive --if-present`). Today that is `apps/api` and `packages/shared`.

| Command             | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `pnpm install`      | Install workspace dependencies                       |
| `pnpm dev`          | Run dev servers in parallel (currently the API only) |
| `pnpm build`        | Build all packages (currently the API bundle)        |
| `pnpm typecheck`    | Type-check all packages with `tsc --noEmit`          |
| `pnpm test`         | Run Vitest in all packages                           |
| `pnpm lint`         | _No-op for now: ESLint is not configured yet_        |
| `pnpm format`       | Format the repo with Prettier                        |
| `pnpm format:check` | Check formatting without writing                     |

### API (`apps/api/package.json`)

Run from the repo root with `pnpm --filter @ai-commerce-pos/api <script>`, or from `apps/api` with `pnpm <script>`.

| Script       | Command                                                              | Purpose                              |
| ------------ | -------------------------------------------------------------------- | ------------------------------------ |
| `dev`        | `tsx watch --env-file-if-exists=.env src/server.ts`                  | Dev server, restarts on change       |
| `build`      | `tsdown`                                                             | Production bundle → `dist/server.js` |
| `start`      | `node --env-file-if-exists=.env --enable-source-maps dist/server.js` | Run the production bundle            |
| `typecheck`  | `tsc --noEmit`                                                       | Type-check only                      |
| `test`       | `vitest run`                                                         | Run tests once                       |
| `test:watch` | `vitest`                                                             | Run tests in watch mode              |

### Shared (`packages/shared/package.json`)

| Script      | Purpose                                         |
| ----------- | ----------------------------------------------- |
| `typecheck` | Type-check (no Node.js or DOM types allowed)    |
| `test`      | Run Vitest (passes when there are no tests yet) |

### Common workflows

```bash
# Tests, typecheck
pnpm test
pnpm typecheck

# Production build and run
pnpm build
pnpm --filter @ai-commerce-pos/api start     # http://localhost:4000

# Before committing
pnpm typecheck && pnpm test && pnpm format:check
```

Stop a running server with **Ctrl+C**. The server handles `SIGINT`/`SIGTERM` by closing the HTTP
server, and forces an exit after 10 seconds if connections stay open.

## API Endpoints

### `GET /health`

Liveness check. Needs no database and no authentication.

```http
GET /health
```

```json
{
  "status": "ok",
  "service": "api",
  "timestamp": "2026-11-22T12:06:24.753Z",
  "uptimeSeconds": 0
}
```

- Status `200`, header `Cache-Control: no-store`
- Response shape: `healthResponseSchema` in `@ai-commerce-pos/shared`

### Error responses

Every error uses the same shape (`apiErrorResponseSchema` in `@ai-commerce-pos/shared`):

```json
{ "error": { "code": "NOT_FOUND", "message": "Route GET /nope not found" } }
```

| Situation               | Status | `code`             |
| ----------------------- | ------ | ------------------ |
| Unknown route           | 404    | `NOT_FOUND`        |
| Malformed JSON body     | 400    | `INVALID_JSON`     |
| Zod validation failure  | 400    | `VALIDATION_ERROR` |
| Unexpected server error | 500    | `INTERNAL_ERROR`   |

In `production`, 500 responses never include internal error messages.

## Local MySQL Setup (MySQL 9.3) — for the upcoming database phase

_The API does not connect to MySQL yet. These steps prepare for the Prisma phase._

Development uses the **existing local MySQL 9.3 Windows service** on `127.0.0.1:3306`.
Nothing in this repository creates databases automatically. Run these steps yourself, by hand.

1. Connect as an administrative user:

   ```bash
   mysql -u root -p -h 127.0.0.1 -P 3306
   ```

2. Create a dedicated database and user (choose your own strong password):

   ```sql
   CREATE DATABASE ai_commerce_pos
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_0900_ai_ci;

   CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'your_strong_password';
   GRANT ALL PRIVILEGES ON ai_commerce_pos.* TO 'pos_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

   `utf8mb4` is required for Burmese (Myanmar Unicode) text.

3. **Prisma shadow database (needed later for `prisma migrate dev`).**
   Prisma uses a temporary "shadow" database to detect schema drift. Choose one approach:
   - Create it by hand and grant access, then set `SHADOW_DATABASE_URL` in `apps/api/.env` when Prisma is configured:
     ```sql
     CREATE DATABASE ai_commerce_pos_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
     GRANT ALL PRIVILEGES ON ai_commerce_pos_shadow.* TO 'pos_user'@'localhost';
     ```
   - Or give `pos_user` permission to create databases (simpler, but broader access).

4. Put the credentials into `apps/api/.env`. Never commit that file.

> **Production compatibility:** development runs on MySQL **9.3** (an innovation release).
> The production target is MySQL **8.4 LTS**. Verify schema, migrations, and queries against
> MySQL 8.4 LTS **before any deployment**. Do not rely on features that exist only in MySQL 9.x.

## Development Phases

| Phase | Scope                                                                     | Status         |
| ----- | ------------------------------------------------------------------------- | -------------- |
| 0     | Repository foundation and configuration                                   | ✅ Done        |
| 1     | API and web scaffolding, env validation, health check, tenancy middleware | 🟡 In progress |
| 2     | Auth, tenants, branches, roles; tenant-isolation tests                    | ⏳ Not started |
| 3     | Bag Shop POS MVP: catalog, variants, stock ledger, sales, payments        | ⏳ Not started |
| 4     | Offline POS (PWA, IndexedDB, sync)                                        | ⏳ Not started |
| 5     | AI Sales Agent (online customers and in-store staff)                      | ⏳ Not started |
| 6     | Multi-branch operations, transfers, reporting                             | ⏳ Not started |
| 7     | Eyewear Shop industry module                                              | ⏳ Not started |
| 8     | Gold Shop industry module (basic gold inventory)                          | ⏳ Not started |

### Phase 1 progress

| Item                                                | Status         |
| --------------------------------------------------- | -------------- |
| pnpm workspace, version catalog, release-age policy | ✅ Done        |
| Shared schema package (`@ai-commerce-pos/shared`)   | ✅ Done        |
| Express 5 app/server split                          | ✅ Done        |
| Zod environment validation                          | ✅ Done        |
| Central error handling + 404                        | ✅ Done        |
| `GET /health` + integration tests                   | ✅ Done        |
| tsdown production build                             | ✅ Done        |
| ESLint                                              | ⏳ Not started |
| Structured logging, CORS, security headers          | ⏳ Not started |
| Web app scaffolding (React, Vite, Tailwind)         | ⏳ Not started |
| Tenancy middleware                                  | ⏳ Not started |
