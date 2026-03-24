FROM oven/bun:1 AS build
WORKDIR /app

COPY client/package.json client/bun.lock ./client/
RUN cd client && bun install --frozen-lockfile

COPY client/ ./client/
COPY api/ ./api/
RUN cd client && bun run build

FROM caddy:2-alpine
COPY --from=build /app/client/dist /srv
COPY client/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80