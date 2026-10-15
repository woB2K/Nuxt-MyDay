#!/bin/sh
set -eu

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

umask 077
export -p > /run/backup.env
echo "$BACKUP_SCHEDULE . /run/backup.env && backup > /proc/1/fd/1 2>&1" > /etc/crontabs/root
exec crond -f -d 8
