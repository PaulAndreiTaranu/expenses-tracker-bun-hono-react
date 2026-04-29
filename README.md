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
