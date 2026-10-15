#!/bin/sh
set -eu

mode="${1:-}"
snapshot="${2:-latest}"

if [ "$mode" != check ] && [ "$mode" != apply ]; then
  echo "usage: restore check|apply [snapshot]" >&2
  exit 2
fi

dump="$(mktemp)"
trap 'rm -f "$dump"' EXIT
restic dump --host myday "$snapshot" /myday.dump > "$dump"

load() {
  dropdb --if-exists "$1"
  createdb "$1"
  pg_restore --no-owner --single-transaction --dbname="$1" "$dump"
}

swap() {
  psql -d postgres -q -v ON_ERROR_STOP=1 --single-transaction \
    -v current="$PGDATABASE" -v restored="${PGDATABASE}_restore" -v previous="${PGDATABASE}_before_restore" <<'SQL'
ALTER DATABASE :"current" RENAME TO :"previous";
ALTER DATABASE :"restored" RENAME TO :"current";
SQL
}

if [ "$mode" = check ]; then
  load "${PGDATABASE}_check"
  psql -d "${PGDATABASE}_check" -c "
    select table_name as table,
      (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text::int as rows
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name"
  dropdb "${PGDATABASE}_check"
  echo "Snapshot $snapshot restores cleanly"
  exit 0
fi

printf 'Replace database "%s" with snapshot %s? Type the database name to confirm: ' "$PGDATABASE" "$snapshot"
read -r answer
if [ "$answer" != "$PGDATABASE" ]; then
  echo "Aborted" >&2
  exit 1
fi

load "${PGDATABASE}_restore"
dropdb --if-exists "${PGDATABASE}_before_restore"
if ! swap; then
  echo "Swap failed, snapshot is waiting in ${PGDATABASE}_restore. Stop the app first: docker compose stop app" >&2
  exit 1
fi
echo "Restored snapshot $snapshot. Previous database kept as ${PGDATABASE}_before_restore"
