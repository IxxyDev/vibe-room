#!/usr/bin/env sh
set -eu

mkdir -p /app/apps/cms/data /app/apps/cms/media

echo "[entrypoint] Running Payload migrations..."
cd /app/apps/cms && pnpm exec payload migrate

DIST_DIR=/app/apps/web/dist

if [ -z "$(ls -A "$DIST_DIR" 2>/dev/null || true)" ]; then
  echo "[entrypoint] Empty dist volume — running initial Astro build..."
  cd /app && pnpm --filter @vibe-room/web build
  echo "[entrypoint] Initial build complete."
fi

cd /app
exec pnpm --filter @vibe-room/cms start
