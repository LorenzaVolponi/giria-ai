#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[guard] Checking for merge conflict markers..."
if rg -n "^(<<<<<<<|=======|>>>>>>>)" src tests >/dev/null; then
  echo "[guard] ERROR: Merge conflict markers detected."
  exit 1
fi

echo "[guard] Checking Next.js proxy/middleware compatibility..."
if [[ -f "src/middleware.ts" && -f "src/proxy.ts" ]]; then
  echo "[guard] ERROR: Next.js 16 cannot have both src/middleware.ts and src/proxy.ts."
  exit 1
fi

echo "[guard] Running lint..."
npm run -s lint

echo "[guard] Running tests..."
npm run -s test

echo "[guard] Running production build..."
npm run -s build

echo "[guard] OK: predeploy guard checks passed."
