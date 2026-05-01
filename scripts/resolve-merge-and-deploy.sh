#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

TARGET_BRANCH="${1:-main}"
DEPLOY="${DEPLOY:-false}"

CURRENT_BRANCH=$(git branch --show-current)
echo "[merge-auto] Branch atual: $CURRENT_BRANCH"

git config rerere.enabled true
git fetch origin "$TARGET_BRANCH"

set +e
git rebase "origin/$TARGET_BRANCH" -X theirs
REBASERC=$?
set -e

if [[ $REBASERC -ne 0 ]]; then
  echo "[merge-auto] Conflito detectado. Tentando resolução automática por padrão..."
  git checkout --theirs . || true
  git add -A
  git rebase --continue || {
    echo "[merge-auto] Não foi possível resolver automaticamente. Abortando rebase."
    git rebase --abort || true
    exit 1
  }
fi

echo "[merge-auto] Rebase finalizado. Rodando checks..."
npm install
npm run lint
npm run build
bash scripts/security-check.sh

git push --force-with-lease origin "$CURRENT_BRANCH"

echo "[merge-auto] Push com rebase concluído."

if [[ "$DEPLOY" == "true" ]]; then
  if ! command -v vercel >/dev/null 2>&1; then
    npm i -g vercel
  fi
  if [[ -z "${VERCEL_TOKEN:-}" || -z "${VERCEL_ORG_ID:-}" || -z "${VERCEL_PROJECT_ID:-}" ]]; then
    echo "[deploy] Defina VERCEL_TOKEN, VERCEL_ORG_ID e VERCEL_PROJECT_ID."
    exit 1
  fi
  echo "[deploy] Executando deploy em produção na Vercel..."
  vercel deploy --prod --token "$VERCEL_TOKEN"
fi
