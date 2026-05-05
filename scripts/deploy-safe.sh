#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

"$ROOT_DIR/scripts/predeploy-guard.sh"

if ! command -v vercel >/dev/null 2>&1; then
  echo "[deploy] Vercel CLI not found. Installing with npx for this run..."
fi

echo "[deploy] Deploying to Vercel production..."
npx vercel --prod --yes

echo "[deploy] Done."
