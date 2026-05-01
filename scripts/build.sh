#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[build] Instalando dependências..."
npm install

if npm run | rg -q "lint"; then
  echo "[build] Rodando lint..."
  npm run lint
fi

echo "[build] Rodando build..."
npm run build

echo "[build] Build concluído com sucesso ✅"
