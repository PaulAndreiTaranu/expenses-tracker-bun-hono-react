# Expenses Tracker (Bun + Hono)

## Overview

Full-stack expense tracker built with [Bun](https://bun.sh), [Hono](https://hono.dev), and
[React](https://react.dev). Features a REST API with Zod validation and a React SPA with Tailwind
CSS and shadcn/ui. Containerized with Docker and deployed via Caddy reverse proxy.

### Tech Stack

- **Runtime:** Bun
- **Server:** Hono + Hono RPC
- **Client:** React + Vite
- **Data fetching:** TanStack Query + TanStack Router
- **Forms:** TanStack Form
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Validation:** Zod + @hono/zod-validator
- **Auth:** Better Auth (email + password)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Language:** TypeScript

## Get Started

### Prerequisites

- [Bun](https://bun.sh) installed

### Install & Run

```bash
# API
cd api && bun install && bun run dev

# Client (separate terminal)
cd client && bun install && bun run dev
```

Server runs at `http://localhost:3002`. Client runs at `http://localhost:5173` with API requests
proxied to the server.

### Database setup

The project has **two independent migration systems** sharing one Postgres database:

- **Better Auth** manages `user`, `session`, `account`, `verification` (auth-related tables).
  Driven by its own CLI; SQL output lives in `api/better-auth_migrations/`.
- **Drizzle** manages app-level tables (`expenses`, and any future ones). Schema is in
  `api/lib/schema.ts`, SQL output in `api/lib/drizzle/`.

Whenever you spin up a fresh Postgres volume — first time, after `docker compose down -v`, after
switching machines — apply **both** migrations before sign-up/sign-in or expense routes will work,
otherwise you'll see `relation "user" does not exist` or `relation "expenses" does not exist`:

```bash
cd api
bun run db:auth:migrate   # Better Auth tables
bun run db:migrate        # Drizzle tables
```

Re-run only the relevant one when its source of truth changes:

```bash
# After editing api/lib/auth.ts (e.g. new additionalFields)
cd api
bun run db:auth:generate
bun run db:auth:migrate

# After editing api/lib/schema.ts (e.g. new column or table)
cd api
bun run db:generate
bun run db:migrate
```

### API Endpoints

All `/api/v1/*` routes require an authenticated session (cookie set by Better Auth).

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/api/v1/expenses`             | List all expenses    |
| GET    | `/api/v1/expenses/total-spent` | Get total spent      |
| POST   | `/api/v1/expenses`             | Create an expense    |
| GET    | `/api/v1/expenses/:id`         | Get expense by ID    |
| DELETE | `/api/v1/expenses/:id`         | Delete expense by ID |
| \*     | `/api/auth/**`                 | Better Auth handler  |

## Architecture

- **`api/`** — Bun + Hono REST API. Handles routing, validation, auth, and data access. In
  production, also serves the built client as static files.
- **`client/`** — React SPA built with Vite. Uses Hono RPC for type-safe API calls and TanStack
  Query for data fetching.

Each side has its own `package.json`, `tsconfig.json`, and `node_modules`. Deployed as a single
Docker container where Hono serves both the API and the static client build.

### `api/` layout

- `app.ts` / `index.ts` — Hono app and Bun server entry.
- `routes/` — route modules (e.g. `expenses.ts`).
- `middleware/` — factory-pattern Hono middleware (e.g. `auth.middleware.ts`).
- `lib/` — shared library code:
  - `auth.ts` — Better Auth instance.
  - `db.ts` — Drizzle client (singleton `Pool` + `drizzle()`).
  - `schema.ts` — Drizzle table definitions.
  - `drizzle/` — Drizzle SQL output.
- `better-auth_migrations/` — Better Auth's CLI output (separate from Drizzle's).

### Auth Flow (Better Auth)

Better Auth is mounted on the Hono server at `/api/auth/*` and owns all auth-related endpoints
(sign-up, sign-in, sign-out, get-session). Sessions are stored in Postgres and tracked via an
HTTP-only cookie (`better-auth.session_token`).

**Request lifecycle:**

1. Client calls `authClient.signUp.email({...})` / `signIn.email({...})` from
   `client/src/lib/auth-client.tsx`. The call hits `POST /api/auth/sign-in/email` on the API.
2. Better Auth validates credentials against the `user` / `account` tables, creates a row in
   `session`, and responds with `Set-Cookie: better-auth.session_token=...`.
3. Because the client is configured with `credentials: 'include'`, subsequent requests to
   `/api/v1/*` carry the cookie automatically.
4. A Hono middleware protecting `/api/v1/*` calls `auth.api.getSession({ headers })`. If no valid
   session exists, the middleware returns `401 Unauthorized` before the route ever runs.
5. When authenticated, the middleware attaches `user` and `session` to the Hono context via
   `c.set('user', ...)` so downstream routes can read them in a type-safe way.

**Why each config knob matters:**

- `emailAndPassword: { enabled: true }` — registers the `/sign-up/email` and `/sign-in/email`
  endpoints. Without this they 404.
- `trustedOrigins: [...]` — Better Auth checks the `Origin` header on auth requests and rejects
  anything not in this list with a `403`. In dev the Vite client runs on a different origin
  (`http://localhost:5173`) than the API (`http://localhost:3002`), so the dev URL must be listed.
  In production, client and API share an origin, so the production URL goes here instead.
- `database: new Pool(...)` — Better Auth speaks directly to Postgres via the `pg` driver and
  manages its own schema.
- The Hono CORS middleware (`credentials: true`, `origin: http://localhost:5173`) is what allows the
  browser to send and receive cookies cross-origin during local dev. In production, same-origin
  requests don't need CORS.

## Build Log

### 1. Server setup

```bash
bun init
bun add hono @hono/zod-validator zod
```

Created a Hono app with `Bun.serve()`, added logger middleware, and built CRUD routes for expenses
(`GET`, `POST`, `GET /:id`, `DELETE /:id`) with Zod schema validation. Currently uses in-memory fake
data.

### 2. Client setup

```bash
bun create vite@latest client --template react-ts
```

Scaffolded a React + TypeScript app with Vite inside `client/`.

### 3. UI and API integration

```bash
cd client
bun add tailwindcss @tailwindcss/vite
bunx --bun shadcn@latest init
```

Added Tailwind CSS v4 and shadcn/ui components. Connected the client to the Hono API via Vite's dev
proxy and `fetch` calls. Displays total expenses spent using a shadcn Card component.

### 4. Hono RPC and TanStack

```bash
cd client
bun add hono @tanstack/react-query @tanstack/react-router
```

Added Hono RPC (`hono/client`) for end-to-end type safety between API and client. Replaced raw
`fetch` calls with TanStack Query for caching and data fetching. Added TanStack Router for
client-side routing.

### 5. Docker refactor to single container

Consolidated from two containers (API + Caddy) into one. Hono now serves the built React client as
static files via `serveStatic`. Single `Dockerfile` at the root builds the client with Vite, then
runs the Bun API server with the client `dist/` bundled in.

### 6. PostgreSQL and security middleware

Added PostgreSQL as a service in `docker-compose.yml` and a root `.env` for `DATABASE_URL`. Wired
security middleware into the Hono app:

```bash
cd api
bun add hono-rate-limiter
```

- `logger()` — request logs.
- `secureHeaders()` — standard security headers (CSP, HSTS, X-Frame-Options, etc.).
- `rateLimiter(...)` — 100 requests / 15 min per `x-forwarded-for`.
- `cors({ origin: 'http://localhost:5173', credentials: true })` — only applied when
  `NODE_ENV=development` so the Vite dev server can talk to the API with cookies.

### 7. Better Auth (email + password)

```bash
cd api
bun add better-auth pg
bun add -d @types/pg
```

Created `api/auth.ts`:

```ts
import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

export const auth = betterAuth({
    database: new Pool({ connectionString: process.env.DATABASE_URL }),
    emailAndPassword: { enabled: true },
    trustedOrigins: ['http://localhost:5173'],
})
```

Generated and applied the Better Auth schema against Postgres:

```bash
cd api
bunx @better-auth/cli generate   # writes better-auth_migrations/
bunx @better-auth/cli migrate    # creates user / session / account / verification tables
```

Mounted the auth handler and a session-check middleware in `api/app.ts`:

```ts
app.use('/api/v1/*', async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)
    c.set('user', session.user)
    c.set('session', session.session)
    await next()
})

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))
```

On the client:

```bash
cd client
bun add better-auth
```

Created `client/src/lib/auth-client.tsx` with `createAuthClient` and added `/signup` and `/signin`
routes that use TanStack Form to call `authClient.signUp.email` and `authClient.signIn.email`.

Configured the Hono RPC client (`client/src/lib/api.tsx`) to send cookies with every request:

```ts
const client = hc<ApiType>(import.meta.env.VITE_API_URL || '/', {
    init: { credentials: 'include' },
})
```

**Gotchas encountered while wiring this up:**

- Hono's wildcard is `*`, not `**`. Using `/api/auth/**` silently matches nothing and the request
  falls through to `serveStatic`, returning a confusing 404. Use `/api/auth/*`.
- Without `emailAndPassword.enabled`, Better Auth doesn't register `/sign-in/email` and returns 404
  even though the handler is mounted.
- Without `trustedOrigins`, Better Auth returns `403 Invalid origin` for any browser request that
  isn't same-origin — including the Vite dev server.
- The Better Auth schema must be migrated before sign-in works, otherwise Postgres throws
  `relation "user" does not exist`.

### 8. Authenticated routes and per-user data

Built on top of Better Auth: route guards on the client, ownership scoping on the server, role
groundwork for future authorization.

**Server side:**

- Refactored auth into a factory-pattern Hono middleware (`hono/factory`'s `createMiddleware`)
  applied per-route in `expensesRoute.use(AuthMiddleware)` instead of a blanket `/api/v1/*` rule.
  Types for `c.get('user')` and `c.get('session')` travel with the middleware.
- Added a `role` field to the `user` table via Better Auth `additionalFields` (`required: true`,
  `defaultValue: 'user'`, `input: false` so users can't self-promote on sign-up).
- Scoped every expense route by `c.get('user').id`. `GET /:id` and `DELETE /:id` filter on
  ownership and return 404 (not 403) for non-owners to avoid leaking that the ID exists.

**Client side:**

```bash
cd client
bun add @tanstack/react-query
```

- Wrapped `authClient.getSession()` in a TanStack Query (`userQueryOptions`) with
  `staleTime: Infinity` — single source of truth for the current user, fetched once per session
  and cached until invalidated.
- Added `inferAdditionalFields<typeof auth>()` plugin on the Better Auth client so `session.user`
  gains the `role` field via type inference from the server config.
- Created a pathless `_authenticated` layout route (`client/src/routes/_authenticated.tsx`) whose
  `beforeLoad` calls `queryClient.ensureQueryData(userQueryOptions)` and redirects to `/signin` if
  no session. All protected routes live under `client/src/routes/_authenticated/` and inherit the
  guard automatically.
- Added a `/profile` route that displays user details from the session cache.
- Added a `LogoutButton` that calls `authClient.signOut()` and clears the cache via
  `queryClient.setQueryData(userQueryOptions.queryKey, null)`.
- Conditional NavBar that reads `useQuery(userQueryOptions)` and renders signin/signup links or
  protected links + logout based on auth state.

**Cache mutation pattern:** sign-in / sign-up `invalidateQueries` (refetch from `getSession`),
sign-out `setQueryData(..., null)` (instant clear, no round-trip).

**Gotcha:** public routes (`/signin`, `/signup`, `/`) must live **outside** `_authenticated/`.
If they're inside, the unauthenticated redirect targets the same guarded layout and you get an
infinite redirect loop (silent — no console error, just a blank page).

### 9. Drizzle ORM for app-level tables

```bash
cd api
bun add drizzle-orm
bun add -d drizzle-kit
```

Reorganized `api/` so library code lives under `lib/`:

```
api/lib/
├── auth.ts          # Better Auth instance (moved from api/auth.ts)
├── db.ts            # Drizzle client (singleton Pool + drizzle())
├── schema.ts        # Drizzle table definitions
└── drizzle/         # Drizzle SQL output
```

Created `api/drizzle.config.ts` pointing at `lib/schema.ts` and `lib/drizzle/`. Defined the
`expenses` table in `lib/schema.ts` with `id` (uuid, default random), `userId` (varchar, no FK
because the `user` table is owned by Better Auth), `title`, `amount`, and `createdAt`.

Renamed migration scripts to keep the two systems separate:

- `db:auth:generate` / `db:auth:migrate` — Better Auth (was `db:generate` / `db:migrate`).
- `db:generate` / `db:migrate` / `db:studio` — Drizzle.

Replaced the in-memory `fakeExpenses` array in `routes/expenses.ts` with Drizzle queries
(`db.select().from(expenses).where(eq(expenses.userId, user.id))`, etc.). Response shapes are
unchanged so the client's Hono RPC types kept working without edits.

**Notes:**

- Both migration tools share the same `DATABASE_URL` but never touch each other's tables. Don't
  add Better Auth tables to the Drizzle schema — both tools would think they own them.
- `bun --env-file=...` doesn't propagate env to `bunx <tool>` reliably. The `db:*` scripts use
  `export $(cat ../.env | xargs) && bunx ...` instead, the same pattern Better Auth's scripts use.
- Drizzle's `sum()` returns a string (Postgres `NUMERIC` can overflow JS `Number`); coerce with
  `Number(result[0]?.total ?? 0)`.
