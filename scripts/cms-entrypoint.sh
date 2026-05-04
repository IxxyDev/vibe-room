#!/usr/bin/env sh
set -eu

DIST_DIR=/app/apps/web/dist

# Initial Astro build: only on first run when dist volume is empty.
# triggerRebuild handles subsequent rebuilds when CMS content changes.
if [ -z "$(ls -A "$DIST_DIR" 2>/dev/null || true)" ]; then
  echo "[entrypoint] Empty dist volume — running initial Astro build..."
  cd /app && pnpm --filter @vibe-room/web build
  echo "[entrypoint] Initial build complete."
fi

cd /app
exec pnpm --filter @vibe-room/cms start
