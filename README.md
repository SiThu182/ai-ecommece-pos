# AI Commerce POS

A multi-tenant SaaS POS and AI Sales Agent platform for Myanmar SMEs.

- **Pilot industry:** Bag Shops
- **Future industries:** Eyewear Shops, Gold Shops

> **Status: foundation only.** The repository structure and configuration exist.
> No application code, dependencies, database schema, or migrations have been created yet.
> The project **cannot run yet**.

## Technology Stack

| Layer    | Technology                                                          |
| -------- | ------------------------------------------------------------------- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, TanStack Query _(planned)_   |
| Backend  | Node.js 24, Express.js 5, TypeScript, Prisma ORM _(planned)_        |
| Database | MySQL (dev: local 9.3; production target: 8.4 LTS)                  |
| Shared   | Zod, Vitest, pnpm workspace                                         |
| Offline  | IndexedDB-based PWA POS _(future phase)_                            |

## Repository Structure

```
ai-commerce-pos/
├── apps/
│   ├── web/                 React frontend (not implemented yet)
│   │   └── src/
│   │       ├── app/         router, providers, layout
│   │       ├── components/  shared UI components
│   │       ├── features/    feature folders (pos, catalog, inventory, …)
│   │       ├── hooks/       shared React hooks
│   │       ├── lib/         API client, formatters
│   │       └── offline/     IndexedDB / sync (future)
│   └── api/                 Express backend (not implemented yet)
│       ├── src/
│       │   ├── modules/     business domain modules
│       │   ├── core/        config, db, errors, logger, middleware
│       │   └── shared/      backend-internal helpers
│       ├── prisma/          Prisma schema and migrations
│       └── tests/           integration tests
├── packages/
│   └── shared/src/          Zod schemas, DTO types, pure helpers
├── docs/
│   └── adr/                 Architecture Decision Records
├── CLAUDE.md                rules for AI coding assistants
└── README.md
```

Empty folders contain a `.gitkeep` file so Git tracks the structure. Delete each one when the folder gets real files.

## Prerequisites

- **Node.js 24** (see `.nvmrc`). Use the latest 24.x patch release.
- **pnpm 10.33.0**
- **Git**
- **MySQL** running locally (development uses the existing MySQL 9.3 service)

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

## Local MySQL Setup (MySQL 9.3)

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

4. Put the credentials into `apps/api/.env` (see below). Never commit that file.

> **Production compatibility:** development runs on MySQL **9.3** (an innovation release).
> The production target is MySQL **8.4 LTS**. Verify schema, migrations, and queries against
> MySQL 8.4 LTS **before any deployment**. Do not rely on features that exist only in MySQL 9.x.

## Environment Setup

Copy the templates and fill in real values locally:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

| File                    | Contains                                          |
| ----------------------- | ------------------------------------------------- |
| `apps/api/.env`         | Server secrets: database URL, JWT secrets, CORS   |
| `apps/web/.env`         | Public browser config only (`VITE_*` variables)   |

**Every `VITE_*` variable is bundled into public JavaScript. Never put secrets in `apps/web/.env`.**

## Development Commands

Root scripts run the matching script in every workspace package that defines it.
_App packages have not been created yet, so most of these do nothing for now._

| Command             | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `pnpm install`      | Install workspace dependencies                  |
| `pnpm dev`          | Run web and api dev servers in parallel         |
| `pnpm build`        | Build all packages                              |
| `pnpm typecheck`    | Type-check all packages                         |
| `pnpm lint`         | Lint all packages                               |
| `pnpm test`         | Run tests (Vitest) in all packages              |
| `pnpm format`       | Format the repo with Prettier                   |
| `pnpm format:check` | Check formatting without writing                |

## Development Phases

| Phase | Scope                                                                  | Status          |
| ----- | ---------------------------------------------------------------------- | --------------- |
| 0     | Repository foundation and configuration                                | ✅ Done         |
| 1     | API and web scaffolding, env validation, health check, tenancy middleware | ⏳ Not started |
| 2     | Auth, tenants, branches, roles; tenant-isolation tests                 | ⏳ Not started  |
| 3     | Bag Shop POS MVP: catalog, variants, stock ledger, sales, payments     | ⏳ Not started  |
| 4     | Offline POS (PWA, IndexedDB, sync)                                     | ⏳ Not started  |
| 5     | AI Sales Agent (online customers and in-store staff)                   | ⏳ Not started  |
| 6     | Multi-branch operations, transfers, reporting                          | ⏳ Not started  |
| 7     | Eyewear Shop industry module                                           | ⏳ Not started  |
| 8     | Gold Shop industry module (basic gold inventory)                       | ⏳ Not started  |
