FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/cms/package.json ./apps/cms/
COPY apps/web/package.json ./apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cms/node_modules ./apps/cms/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
ARG PAYLOAD_SECRET=build-time-placeholder-secret-32chars
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV NODE_ENV=production
RUN pnpm --filter @vibe-room/cms exec payload generate:importmap || true
RUN pnpm --filter @vibe-room/cms build
RUN pnpm --filter @vibe-room/web build
RUN cp -a /app/apps/web/dist /app/apps/web/.dist-seed

FROM base AS runner
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl tini && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app /app
COPY scripts/cms-entrypoint.sh /usr/local/bin/cms-entrypoint.sh
RUN chmod +x /usr/local/bin/cms-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/cms-entrypoint.sh"]
