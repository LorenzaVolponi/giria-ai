#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[dev] Validando ambiente..."
command -v node >/dev/null || { echo "Node não encontrado"; exit 1; }
command -v npm >/dev/null || { echo "npm não encontrado"; exit 1; }

if [[ ! -d node_modules ]]; then
  echo "[dev] Instalando dependências..."
  npm install
fi

echo "[dev] Iniciando Next.js em desenvolvimento..."
npm run dev
