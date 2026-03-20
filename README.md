# Expense Tracker (Bun + Hono)

## Overview

REST API for tracking expenses, built with [Bun](https://bun.sh) as the runtime and
[Hono](https://hono.dev) as the web framework. This is a learning project following a YouTube
tutorial to explore Bun's capabilities for building APIs.

### Tech Stack

- **Runtime:** Bun
- **Framework:** Hono
- **Validation:** Zod + @hono/zod-validator
- **Language:** TypeScript

## Get Started

### Prerequisites

- [Bun](https://bun.sh) installed

### Install & Run

```bash
# Install dependencies
bun install

# Run in dev mode (with hot reload)
bun run dev

# Run in production mode
bun run start
```

The server starts at `http://localhost:3000`.

### API Endpoints

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/`                    | Health check         |
| GET    | `/api/v1/expenses`     | List all expenses    |
| POST   | `/api/v1/expenses`     | Create an expense    |
| GET    | `/api/v1/expenses/:id` | Get expense by ID    |
| DELETE | `/api/v1/expenses/:id` | Delete expense by ID |

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
