#!/usr/bin/env bash
#
# Deploy the Orvix frontend to a VPS over SSH.
#
# Builds locally, syncs the build output, installs production dependencies on
# the server, and (re)starts the app under pm2 on port 3000.
#
# Configure via environment variables (or a local .env.deploy that you source):
#   DEPLOY_HOST   SSH target or ssh_config alias   (required)
#   DEPLOY_PATH   remote app directory (default: /opt/orvix/frontend)
#   APP_NAME      pm2 process name     (default: orvix-frontend)
#   PORT          listen port          (default: 3003)
#
# Usage:
#   DEPLOY_HOST=projecteon ./scripts/deploy.sh

set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-}"
# /opt itself is root-owned on the VPS, but /opt/orvix belongs to the deploy
# user and holds both services (frontend/ and orchestrator/).
DEPLOY_PATH="${DEPLOY_PATH:-/opt/orvix/frontend}"
APP_NAME="${APP_NAME:-orvix-frontend}"
# 3003 is what the nginx orvix.network vhost proxies "/" to; keep them in sync.
PORT="${PORT:-3003}"
# Public URL of the deployed site. Next.js loads `.env.local` in every mode and
# it OVERRIDES `.env.production`, so a local dev env (http://localhost:3000)
# would otherwise get baked into the client bundle and break every browser-side
# API call. The deploy must build against the real public URLs instead.
DEPLOY_URL="${DEPLOY_URL:-https://orvix.network}"

if [[ -z "${DEPLOY_HOST}" ]]; then
  echo "error: DEPLOY_HOST is not set (e.g. projecteon)" >&2
  exit 1
fi

# Run from the project root regardless of where the script is invoked.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "==> Building production bundle"
# npm ci always wipes node_modules and reinstalls from scratch (~950 MB here),
# which costs ~11 minutes even when no dependency changed. Skip it when
# package-lock.json is byte-identical to the one used for the last install.
# The stamp lives inside node_modules so deleting that directory also discards
# the stamp, and the next deploy reinstalls. Set FORCE_INSTALL=1 to reinstall
# regardless (e.g. if node_modules is suspected corrupt).
LOCK_STAMP="node_modules/.deploy-lock-hash"
LOCK_HASH="$(sha256sum package-lock.json | cut -d' ' -f1)"
if [[ "${FORCE_INSTALL:-0}" != "1" && -f "${LOCK_STAMP}" && "$(cat "${LOCK_STAMP}")" == "${LOCK_HASH}" ]]; then
  echo "    dependencies unchanged since last install -- skipping npm ci"
  echo "    (run with FORCE_INSTALL=1 to reinstall anyway)"
else
  npm ci
  echo "${LOCK_HASH}" > "${LOCK_STAMP}"
fi
# `.env.local` is not ignored by Next's env precedence, so export the public
# URLs explicitly to override it and bake the real endpoints into the bundle.
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-${DEPLOY_URL}}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-${DEPLOY_URL}}"
npm run build

echo "==> Syncing build output to ${DEPLOY_HOST}:${DEPLOY_PATH}"
ssh "${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}'"
rsync -az --delete \
  --include=".next/" --exclude=".next/cache/**" \
  .next package.json package-lock.json next.config.mjs public \
  "${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "==> Installing production dependencies and (re)starting pm2"
# This heredoc is UNQUOTED (<<REMOTE) so the local shell expands the intended
# ${DEPLOY_PATH}/${PORT}/${APP_NAME} before sending. Keep the body free of any
# other dollar-brace or backtick sequences (including in comments) -- they get
# expanded/executed locally too and, under `set -u`, abort the remote script.
#
# We use "npm install" (not "npm ci") for the production deps: the server's npm
# can be a different major than the one that generated package-lock.json, and
# npm ci's strict lockfile-sync check rejects lockfiles missing optional platform
# binaries recorded differently across npm versions. install reconciles in place.
ssh "${DEPLOY_HOST}" bash -s <<REMOTE
  set -euo pipefail
  cd "${DEPLOY_PATH}"
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
