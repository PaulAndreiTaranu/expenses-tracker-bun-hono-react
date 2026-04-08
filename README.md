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
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Validation:** Zod + @hono/zod-validator
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

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/api/v1/expenses`             | List all expenses    |
| GET    | `/api/v1/expenses/total-spent` | Get total spent      |
| POST   | `/api/v1/expenses`             | Create an expense    |
| GET    | `/api/v1/expenses/:id`         | Get expense by ID    |
| DELETE | `/api/v1/expenses/:id`         | Delete expense by ID |

## Architecture

- **`api/`** — Bun + Hono REST API. Handles routing, validation, and data access. In production,
  also serves the built client as static files.
- **`client/`** — React SPA built with Vite. Uses Hono RPC for type-safe API calls and TanStack
  Query for data fetching.

Each side has its own `package.json`, `tsconfig.json`, and `node_modules`. Deployed as a single
Docker container where Hono serves both the API and the static client build.

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
