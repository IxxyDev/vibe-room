#!/usr/bin/env sh
set -eu

DIST_DIR=/app/apps/web/dist
SEED_DIR=/app/apps/web/.dist-seed

if [ -d "$SEED_DIR" ] && [ -z "$(ls -A "$DIST_DIR" 2>/dev/null || true)" ]; then
  echo "[entrypoint] Seeding empty dist volume from image..."
  mkdir -p "$DIST_DIR"
  cp -a "$SEED_DIR/." "$DIST_DIR/"
fi

exec pnpm --filter @vibe-room/cms start
