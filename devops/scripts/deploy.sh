#!/usr/bin/env bash
# Zero-downtime blue/green deploy of the backend on the EC2 host.
#
#   devops/scripts/deploy.sh <image-tag>
#
# Starts the idle color with the new image, waits until it is healthy, points
# nginx at it with a graceful reload, then stops the old color after a drain
# period. If the new color never becomes healthy, traffic is left untouched.
set -euo pipefail

IMAGE_TAG="${1:?usage: deploy.sh <image-tag>}"
export IMAGE_TAG

cd "$(dirname "$0")/../.."

COMPOSE=(docker compose -f docker-compose.prod.yml)
UPSTREAM_DIR=devops/nginx/upstream
UPSTREAM_FILE="$UPSTREAM_DIR/active.conf"
HEALTH_TIMEOUT=120
DRAIN_SECONDS=30

exec 9>/tmp/adey-deploy.lock
flock -n 9 || { echo "another deploy is running" >&2; exit 1; }

log() { echo "[deploy] $*"; }

write_upstream() {
  printf 'upstream backend {\n    server backend_%s:8000;\n}\n' "$1" > "$UPSTREAM_FILE.tmp"
  mv "$UPSTREAM_FILE.tmp" "$UPSTREAM_FILE"
}

if [[ -f "$UPSTREAM_FILE" ]] && grep -q backend_green "$UPSTREAM_FILE"; then
  ACTIVE=green NEXT=blue
else
  ACTIVE=blue NEXT=green
fi
log "image=$IMAGE_TAG active=$ACTIVE next=$NEXT"

log "pulling images"
"${COMPOSE[@]}" pull backend_$NEXT worker migrate
"${COMPOSE[@]}" up -d broker

log "running migrations"
"${COMPOSE[@]}" run --rm migrate

log "starting backend_$NEXT"
"${COMPOSE[@]}" up -d --no-deps --force-recreate backend_$NEXT
container=$("${COMPOSE[@]}" ps -q backend_$NEXT)

status=starting
for ((i = 0; i < HEALTH_TIMEOUT; i += 2)); do
  status=$(docker inspect -f '{{.State.Health.Status}}' "$container")
  [[ "$status" == healthy ]] && break
  sleep 2
done
if [[ "$status" != healthy ]]; then
  log "backend_$NEXT is $status after ${HEALTH_TIMEOUT}s, aborting; backend_$ACTIVE keeps serving"
  "${COMPOSE[@]}" logs --tail 100 backend_$NEXT || true
  "${COMPOSE[@]}" stop backend_$NEXT
  exit 1
fi

log "switching nginx to backend_$NEXT"
previous=$(cat "$UPSTREAM_FILE" 2>/dev/null || true)
write_upstream "$NEXT"
if [[ -n "$("${COMPOSE[@]}" ps -q --status running nginx)" ]]; then
  if ! "${COMPOSE[@]}" exec -T nginx nginx -t; then
    log "nginx config test failed, restoring previous upstream"
    if [[ -n "$previous" ]]; then printf '%s\n' "$previous" > "$UPSTREAM_FILE"; else rm -f "$UPSTREAM_FILE"; fi
    "${COMPOSE[@]}" stop backend_$NEXT
    exit 1
  fi
  "${COMPOSE[@]}" exec -T nginx nginx -s reload
else
  "${COMPOSE[@]}" up -d nginx certbot
fi

log "draining backend_$ACTIVE for ${DRAIN_SECONDS}s"
sleep "$DRAIN_SECONDS"
"${COMPOSE[@]}" stop backend_$ACTIVE

log "restarting worker"
"${COMPOSE[@]}" up -d --no-deps worker

docker image prune -f >/dev/null
log "done: backend_$NEXT is live on $IMAGE_TAG"
