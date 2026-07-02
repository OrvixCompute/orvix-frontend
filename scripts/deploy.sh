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
# Default 3003: the target VPS already runs other apps on 3000/3001/3002, so the
# Orvix frontend uses 3003. nginx (orvix.network vhost) proxies to this port.
PORT="${PORT:-3003}"

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
  # Use "npm install" (not "npm ci") for the production deps: the server's npm
  # can be a different major than the one that generated package-lock.json, and
  # npm ci's strict lockfile-sync check rejects lockfiles missing optional
  # platform binaries recorded differently across npm versions. install is
  # lenient and reconciles the lockfile in place.
  # NOTE: this heredoc is unquoted (<<REMOTE) for ${VAR} expansion, so never use
  # backticks here -- they trigger local command substitution and corrupt it.
  npm install --omit=dev --no-audit --no-fund
  export PORT="${PORT}"
  if pm2 describe "${APP_NAME}" > /dev/null 2>&1; then
    pm2 restart "${APP_NAME}" --update-env
  else
    pm2 start "npm" --name "${APP_NAME}" -- start
  fi
  pm2 save
REMOTE

echo "==> Deployed. ${APP_NAME} is serving on port ${PORT} at ${DEPLOY_HOST}."
