#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

BRANCH=$(git branch --show-current)

if [[ -z "$(git status --porcelain)" ]]; then
  echo "[auto-pr] Sem alterações pendentes."
  exit 0
fi

MSG="${1:-chore: manutenção automática}"

echo "[auto-pr] Commitando alterações..."
git add -A
git commit -m "$MSG"

echo "[auto-pr] Fazendo push..."
git push -u origin "$BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "[auto-pr] Criando PR com label automerge..."
  gh pr create --fill --label automerge || true
else
  echo "[auto-pr] gh CLI não encontrado. PR deve ser aberto manualmente."
fi
