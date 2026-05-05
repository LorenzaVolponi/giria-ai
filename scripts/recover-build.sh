#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[recover] Removing transient caches/artifacts..."
rm -rf .next node_modules/.cache

echo "[recover] Re-installing dependencies from lockfile..."
npm ci

echo "[recover] Running predeploy guard..."
npm run -s predeploy:guard

echo "[recover] Build recovery finished successfully."
