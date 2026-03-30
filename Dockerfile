FROM oven/bun:1 AS client-build
WORKDIR /app/client

COPY client/package.json client/bun.lock ./
RUN bun install --frozen-lockfile

COPY client/ .
RUN bun run build

FROM oven/bun:1 AS base
WORKDIR /app

COPY api/package.json api/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY api/ .
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 3002
CMD ["bun", "run", "start"]