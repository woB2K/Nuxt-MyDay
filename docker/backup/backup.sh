#!/bin/sh
set -eu

ping() {
  [ -n "${BACKUP_PING_URL:-}" ] || return 0
  curl -fsS -m 10 --retry 3 -o /dev/null "$BACKUP_PING_URL$1" || true
}

snapshot() {
  restic backup --host myday --stdin-filename myday.dump --stdin-from-command -- pg_dump --format=custom --compress=0 \
    && restic forget --host myday --prune --keep-daily 7 --keep-weekly 4 --keep-monthly 6 \
    && restic check
}

ping /start
if snapshot; then
  ping ""
else
  ping /fail
  exit 1
fi
