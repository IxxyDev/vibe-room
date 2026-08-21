#!/usr/bin/env sh
set -eu

ts=$(date +%Y%m%d-%H%M%S)
out=${1:-./backups}
mkdir -p "$out"

docker compose exec -T cms sh -c '
  set -eu
  rm -rf /tmp/backup-snapshot
  mkdir -p /tmp/backup-snapshot/data
  sqlite3 /app/apps/cms/data/vibe-room.db ".backup /tmp/backup-snapshot/data/vibe-room.db"
  tar -czf - -C /tmp/backup-snapshot data -C /app/apps/cms media
  rm -rf /tmp/backup-snapshot
' > "$out/vibe-room-$ts.tar.gz"

ls -1t "$out"/vibe-room-*.tar.gz | tail -n +15 | xargs -r rm -f

echo "Backup: $out/vibe-room-$ts.tar.gz"
