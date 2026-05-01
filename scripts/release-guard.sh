#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[release-guard] Iniciando gate de release..."

npm install
npm run lint
npm run build
bash scripts/security-check.sh

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[release-guard][WARN] Há alterações locais não commitadas."
fi

echo "[release-guard] Gate concluído com sucesso ✅"
