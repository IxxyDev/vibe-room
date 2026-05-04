#!/usr/bin/env sh
set -eu

ts=$(date +%Y%m%d-%H%M%S)
out=${1:-./backups}
mkdir -p "$out"

docker compose exec -T cms tar -czf - -C /app/apps/cms data media > "$out/vibe-room-$ts.tar.gz"

ls -1t "$out"/vibe-room-*.tar.gz | tail -n +15 | xargs -r rm -f

echo "Backup: $out/vibe-room-$ts.tar.gz"
