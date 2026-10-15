#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."

env_file="$(mktemp)"
cat > "$env_file" <<'EOF'
POSTGRES_PASSWORD=smoke
NUXT_JWT_ACCESS_SECRET=smoke
NUXT_JWT_REFRESH_SECRET=smoke
NUXT_PUBLIC_APP_URL=http://localhost
BACKUP_PASSWORD=smoke
BACKUP_SCHEDULE='* * * * *'
BACKUP_REPOSITORY=rclone::local:/var/lib/backup/repo
EOF

compose() {
  docker compose -p myday-backup-smoke --env-file "$env_file" "$@"
}

sql() {
  compose exec -T db psql -U myday -d "${2:-myday}" -Atc "$1"
}

cleanup() {
  compose down -v --remove-orphans > /dev/null 2>&1 || true
  rm -f "$env_file"
}
trap cleanup EXIT

compose up -d --wait db
sql 'create table smoke (id int); insert into smoke select generate_series(1, 100)'
compose run --rm -T backup restic init

compose up -d --build backup
for _ in $(seq 1 30); do
  compose logs backup | grep -q 'no errors were found' && break
  sleep 5
done
compose logs backup
compose logs backup | grep -q 'no errors were found'
compose stop backup

sql 'delete from smoke where id > 10'
compose run --rm -T backup restore check | tee /dev/stderr | grep -Eq 'smoke +\| +100'
echo myday | compose run --rm -T backup restore apply

[ "$(sql 'select count(*) from smoke')" = 100 ]
[ "$(sql 'select count(*) from smoke' myday_before_restore)" = 10 ]
echo 'backup smoke passed'
