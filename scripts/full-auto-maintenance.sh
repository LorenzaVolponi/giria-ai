#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

BRANCH="${AUTO_BRANCH:-bot/auto-maintenance-$(date +%Y%m%d-%H%M%S)}"
COMMIT_MSG="${AUTO_COMMIT_MSG:-chore: auto manutenção e correções}"

command -v git >/dev/null || { echo "git não encontrado"; exit 1; }
command -v npm >/dev/null || { echo "npm não encontrado"; exit 1; }

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[auto] Há mudanças locais; criando branch para preservar estado atual."
fi

git checkout -b "$BRANCH"

echo "[auto] Instalando dependências e executando hard checks"
npm install
npm run lint
npm run build
bash scripts/security-check.sh
bash scripts/agents/orchestrator.sh

echo "[auto] Aplicando autofix"
npm run lint -- --fix || true

if [[ -z "$(git status --porcelain)" ]]; then
  echo "[auto] Nenhuma mudança para subir."
  exit 0
fi

git add -A
git commit -m "$COMMIT_MSG"
git push -u origin "$BRANCH"

if command -v gh >/dev/null 2>&1; then
  PR_URL=$(gh pr create --fill --label automerge --base main --head "$BRANCH" || true)
  echo "[auto] PR: $PR_URL"
  gh pr merge --auto --squash "$BRANCH" || true
else
  echo "[auto] gh não instalado: crie PR manualmente para $BRANCH"
fi
