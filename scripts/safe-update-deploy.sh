#!/usr/bin/env bash
set -Eeuo pipefail

# Safe auto update + deploy with rollback for Next.js app.
# Usage:
#   bash scripts/safe-update-deploy.sh
#   BRANCH=main APP_NAME=giria-ai bash scripts/safe-update-deploy.sh

BRANCH="${BRANCH:-main}"
APP_NAME="${APP_NAME:-giria-ai}"
PORT="${PORT:-3000}"
HEALTH_PATH="${HEALTH_PATH:-/api/v1/health}"
ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
LOG_PREFIX="[safe-deploy]"

say() { echo "$LOG_PREFIX $*"; }
run() { say "$*"; "$@"; }

cd "$ROOT_DIR"

if [[ ! -d .git ]]; then
  echo "${LOG_PREFIX} ERRO: execute dentro do repositório git." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "${LOG_PREFIX} ERRO: há alterações locais não commitadas." >&2
  git status --short
  exit 1
fi

PREV_SHA="$(git rev-parse --short HEAD)"
say "Commit atual: $PREV_SHA"

rollback() {
  local code=$?
  say "Falha detectada. Voltando para $PREV_SHA..."
  git reset --hard "$PREV_SHA" || true
  npm ci || true
  npm run build || true
  if command -v pm2 >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" || pm2 start npm --name "$APP_NAME" -- start || true
  fi
  say "Rollback concluído."
  exit "$code"
}
trap rollback ERR

run git fetch --all --prune
run git checkout "$BRANCH"
run git pull --rebase origin "$BRANCH"

run npm ci
run npm run lint
run npm test
run npm run build

if command -v pm2 >/dev/null 2>&1; then
  run pm2 restart "$APP_NAME" || run pm2 start npm --name "$APP_NAME" -- start
  run pm2 save || true
else
  say "pm2 não encontrado. Iniciando servidor temporário para smoke test..."
  npm run start -- --port "$PORT" > /tmp/${APP_NAME}-safe-deploy.log 2>&1 &
  APP_PID=$!
  trap 'kill "$APP_PID" >/dev/null 2>&1 || true; rollback' ERR
fi

say "Aguardando healthcheck em http://127.0.0.1:${PORT}${HEALTH_PATH}"
READY=false
for _ in {1..60}; do
  if curl -fsS "http://127.0.0.1:${PORT}${HEALTH_PATH}" >/dev/null; then
    READY=true
    break
  fi
  sleep 1
done

if [[ "$READY" != true ]]; then
  echo "${LOG_PREFIX} ERRO: healthcheck não respondeu em até 60s." >&2
  if command -v pm2 >/dev/null 2>&1; then
    pm2 logs "$APP_NAME" --lines 100 || true
  else
    tail -n 100 "/tmp/${APP_NAME}-safe-deploy.log" || true
  fi
  exit 1
fi

if [[ -x scripts/api-contract-check.sh ]]; then
  run bash scripts/api-contract-check.sh "http://127.0.0.1:${PORT}"
fi

if [[ "${RUN_SWEEP:-0}" == "1" && -x scripts/system-sweep.sh ]]; then
  run bash scripts/system-sweep.sh
fi

say "Deploy atualizado com sucesso ✅"
say "Novo commit ativo: $(git rev-parse --short HEAD)"
