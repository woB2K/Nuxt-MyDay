#!/bin/sh
set -eu

usage() {
  echo "Usage: init-env.sh <domain or URL> [--no-caddy]"
  echo "  init-env.sh myday.example.com         HTTPS by the bundled Caddy on ports 80/443"
  echo "  init-env.sh https://myday.example.com --no-caddy   your own reverse proxy in front of 127.0.0.1:3000"
}

[ $# -ge 1 ] || { usage; exit 1; }

if [ -e .env ]; then
  echo ".env already exists, not touching it" >&2
  exit 1
fi

secret() {
  head -c 64 /dev/urandom | base64 | tr -d '\n/+=' | cut -c1-"$1"
}

domain=$(printf '%s' "$1" | sed -e 's#^https\{0,1\}://##' -e 's#/.*$##')
profiles=caddy
[ "${2:-}" = "--no-caddy" ] && profiles=

cat > .env <<ENV
MYDAY_VERSION=latest
NUXT_PUBLIC_APP_URL=https://$domain

POSTGRES_USER=myday
POSTGRES_PASSWORD=$(secret 32)
POSTGRES_DB=myday

NUXT_JWT_ACCESS_SECRET=$(secret 48)
NUXT_JWT_REFRESH_SECRET=$(secret 48)

ALLOW_REGISTRATION=false

COMPOSE_PROFILES=$profiles
MYDAY_DOMAIN=$domain

APP_BIND=127.0.0.1
APP_PORT=3000
NUXT_PROXY_HOPS=1
ENV

chmod 600 .env
echo "Wrote .env for https://$domain"
echo "Next: docker compose up -d, then open https://$domain and create the first account — it becomes the family owner."
