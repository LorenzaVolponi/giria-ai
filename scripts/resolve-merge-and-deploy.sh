#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

TARGET_BRANCH="${1:-main}"
SOURCE_BRANCH="${2:-$(git branch --show-current)}"
DEPLOY="${DEPLOY:-false}"
AUTO_RESOLVE_CODE="${AUTO_RESOLVE_CODE:-false}"

if [[ -z "$SOURCE_BRANCH" ]]; then
  echo "[merge-auto] Não foi possível detectar branch de origem." >&2
  exit 1
fi

echo "[merge-auto] Source: $SOURCE_BRANCH | Target: $TARGET_BRANCH"

git config rerere.enabled true
git fetch origin "$TARGET_BRANCH" "$SOURCE_BRANCH"
git checkout "$SOURCE_BRANCH"
DEPLOY="${DEPLOY:-false}"

CURRENT_BRANCH=$(git branch --show-current)
echo "[merge-auto] Branch atual: $CURRENT_BRANCH"

git config rerere.enabled true
git fetch origin "$TARGET_BRANCH"

set +e
git rebase "origin/$TARGET_BRANCH" -X theirs
REBASERC=$?
set -e


apply_aggressive_resolution() {
  echo "[merge-auto] AUTO_RESOLVE_CODE=true -> aplicando política por diretório (.ts/.tsx)."

  # Regras sugeridas (ajuste conforme convenção do time):
  # - src/app/** (.ts/.tsx): preferir target/main (theirs)
  # - src/components/** e src/lib/** (.ts/.tsx): preferir branch atual (ours)
  mapfile -t conflicted < <(git diff --name-only --diff-filter=U)
  for file in "${conflicted[@]}"; do
    case "$file" in
      src/app/*.ts|src/app/*.tsx|src/app/*/*.ts|src/app/*/*.tsx|src/app/*/*/*.ts|src/app/*/*/*.tsx)
        git checkout --theirs -- "$file" || true
        ;;
      src/components/*.ts|src/components/*.tsx|src/components/*/*.ts|src/components/*/*.tsx|src/components/*/*/*.ts|src/components/*/*/*.tsx|src/lib/*.ts|src/lib/*/*.ts)
        git checkout --ours -- "$file" || true
        ;;
      *)
        git checkout --theirs -- "$file" || true
        ;;
    esac
  done

  git add -A
}


if [[ $REBASERC -ne 0 ]]; then
  echo "[merge-auto] Conflito detectado. Aplicando resolução automática (theirs)..."
  if [[ "$AUTO_RESOLVE_CODE" == "true" ]]; then
    apply_aggressive_resolution
  else
    git checkout --theirs . || true
    git add -A
  fi
  git rebase --continue || {
    echo "[merge-auto] Falha na resolução automática. Abortando rebase." >&2
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

echo "[merge-auto] Rebase concluído. Rodando checks obrigatórios..."
npm ci
npm run lint
npm run build
npm run test

git push --force-with-lease origin "$SOURCE_BRANCH"
echo "[merge-auto] Push sincronizado com sucesso."
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
    echo "[deploy] Defina VERCEL_TOKEN, VERCEL_ORG_ID e VERCEL_PROJECT_ID." >&2
    echo "[deploy] Defina VERCEL_TOKEN, VERCEL_ORG_ID e VERCEL_PROJECT_ID."
    exit 1
  fi
  echo "[deploy] Executando deploy em produção na Vercel..."
  vercel deploy --prod --token "$VERCEL_TOKEN"
fi
