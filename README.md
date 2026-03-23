# Expense Tracker (Bun + Hono)

## Overview

Full-stack expense tracker built with [Bun](https://bun.sh), [Hono](https://hono.dev), and
[React](https://react.dev). Features a REST API with Zod validation and a React SPA with Tailwind
CSS and shadcn/ui. Containerized with Docker and deployed via Caddy reverse proxy.

### Tech Stack

- **Runtime:** Bun
- **Server:** Hono
- **Client:** React + Vite
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Validation:** Zod + @hono/zod-validator
- **Language:** TypeScript

## Get Started

### Prerequisites

- [Bun](https://bun.sh) installed

### Install & Run

```bash
# Server
cd server && bun install && bun run dev

# Client (separate terminal)
cd client && bun install && bun run dev
```

Server runs at `http://localhost:3002`. Client runs at `http://localhost:5173` with API requests
proxied to the server.

### API Endpoints

| Method | Endpoint                        | Description          |
| ------ | ------------------------------- | -------------------- |
| GET    | `/`                             | Health check         |
| GET    | `/api/v1/expenses`              | List all expenses    |
| GET    | `/api/v1/expenses/total-spent`  | Get total spent      |
| POST   | `/api/v1/expenses`              | Create an expense    |
| GET    | `/api/v1/expenses/:id`          | Get expense by ID    |
| DELETE | `/api/v1/expenses/:id`          | Delete expense by ID |

## Architecture

- **`server/`** — Bun + Hono REST API. Handles routing, validation, and data access.
- **`client/`** — React SPA built with Vite. Communicates with the server via API calls.

Each side has its own `package.json`, `tsconfig.json`, and `node_modules`.

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
