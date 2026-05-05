#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[auto] Validando Git..."
git rev-parse --is-inside-work-tree >/dev/null
BRANCH=$(git branch --show-current)
echo "[auto] Branch atual: $BRANCH"

echo "[auto] Instalando dependências..."
npm install

echo "[auto] Rodando segurança..."
bash scripts/security-check.sh

echo "[auto] Rodando build..."
bash scripts/build.sh

read -r -p "Deseja criar commit com alterações atuais? (y/N) " DO_COMMIT
if [[ "$DO_COMMIT" =~ ^[Yy]$ ]]; then
  git status --short
  read -r -p "Mensagem do commit: " MSG
  git add -A
  git commit -m "${MSG:-chore: auto update checks}"
fi

read -r -p "Deseja fazer push para origin/$BRANCH? (y/N) " DO_PUSH
if [[ "$DO_PUSH" =~ ^[Yy]$ ]]; then
  git push origin "$BRANCH"
fi

echo "[auto] Finalizado com segurança."
