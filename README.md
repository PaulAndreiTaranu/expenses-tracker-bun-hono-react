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

```
.
├── index.ts              # Entry point — starts Bun.serve()
├── app.ts                # Hono app setup, middleware, route mounting
├── routes/
│   └── expenses.ts       # Expense CRUD routes and Expense type
├── package.json
└── tsconfig.json
```

- **`index.ts`** — Creates the HTTP server with `Bun.serve()` and passes `app.fetch` as the handler.
- **`app.ts`** — Initializes Hono, registers the logger middleware, and mounts route groups.
- **`routes/expenses.ts`** — Defines the `Expense` type and exposes GET/POST handlers. Currently
  uses in-memory fake data.

## Build Log

- [x] Project init with `bun init`
- [x] Add Hono as web framework
- [x] Setup logger middleware
- [x] Create expenses route with GET and POST
- [x] Add request validation (Zod + @hono/zod-validator)
- [x] Add GET by ID and DELETE endpoints
- [ ] Add PUT endpoint
- [ ] Add persistent storage (database)
- [ ] Add error handling middleware
