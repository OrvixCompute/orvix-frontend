#!/usr/bin/env bash
#
# Deploy the Orvix frontend to a VPS over SSH.
#
# Builds locally, syncs the build output, installs production dependencies on
# the server, and (re)starts the app under pm2 on port 3000.
#
# Configure via environment variables (or a local .env.deploy that you source):
#   DEPLOY_HOST   SSH target, e.g. root@187.127.118.174   (required)
#   DEPLOY_PATH   remote app directory (default: /opt/orvix-frontend)
#   APP_NAME      pm2 process name     (default: orvix-frontend)
#   PORT          listen port          (default: 3000)
#
# Usage:
#   DEPLOY_HOST=root@187.127.118.174 ./scripts/deploy.sh

set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/orvix-frontend}"
APP_NAME="${APP_NAME:-orvix-frontend}"
PORT="${PORT:-3000}"

if [[ -z "${DEPLOY_HOST}" ]]; then
  echo "error: DEPLOY_HOST is not set (e.g. root@187.127.118.174)" >&2
  exit 1
fi

# Run from the project root regardless of where the script is invoked.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "==> Building production bundle"
npm ci
npm run build

echo "==> Syncing build output to ${DEPLOY_HOST}:${DEPLOY_PATH}"
ssh "${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}'"
rsync -az --delete \
  --include=".next/" --exclude=".next/cache/**" \
  .next package.json package-lock.json next.config.mjs public \
  "${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "==> Installing production dependencies and (re)starting pm2"
ssh "${DEPLOY_HOST}" bash -s <<REMOTE
  set -euo pipefail
  cd "${DEPLOY_PATH}"
  npm ci --omit=dev
  export PORT="${PORT}"
  if pm2 describe "${APP_NAME}" > /dev/null 2>&1; then
    pm2 restart "${APP_NAME}" --update-env
  else
    pm2 start "npm" --name "${APP_NAME}" -- start
  fi
  pm2 save
REMOTE

echo "==> Deployed. ${APP_NAME} is serving on port ${PORT} at ${DEPLOY_HOST}."
