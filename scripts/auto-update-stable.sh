#!/usr/bin/env bash
set -Eeuo pipefail

# Automatic update/deploy script pinned to a known-good commit.
# Default stable commit informed by operations:
# https://github.com/LorenzaVolponi/giria-ai/commit/2f428f91e31f84779b5b8ca7296abd03300e8a96

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BRANCH="${BRANCH:-main}"
STABLE_COMMIT="${STABLE_COMMIT:-2f428f91e31f84779b5b8ca7296abd03300e8a96}"
APP_NAME="${APP_NAME:-giria-ai}"
PORT="${PORT:-3000}"
HEALTH_PATH="${HEALTH_PATH:-/api/v1/health}"
RUN_EVERY_MINUTES="${RUN_EVERY_MINUTES:-0}"
LOG_PREFIX="[auto-stable]"

say() { echo "$LOG_PREFIX $*"; }
fail() { echo "$LOG_PREFIX ERRO: $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatório não encontrado: $1"
}

require_cmd git
require_cmd npm
require_cmd curl

cd "$REPO_DIR"
[[ -d .git ]] || fail "diretório não é um repositório git: $REPO_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  fail "há alterações locais não commitadas. limpe antes de executar."
fi

NODE_MAJOR="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
if [[ "$NODE_MAJOR" -ne 20 && "$NODE_MAJOR" -ne 22 ]]; then
  fail "Node $(node -v) incompatível. Use Node 20 ou 22 LTS."
fi

run_once() {
  local prev_sha
  prev_sha="$(git rev-parse --short HEAD)"
  say "commit atual: $prev_sha"

  trap 'rollback "$prev_sha"' ERR

  git fetch --all --prune
  git checkout "$BRANCH"
  git pull --rebase origin "$BRANCH"

  if ! git cat-file -e "${STABLE_COMMIT}^{commit}" 2>/dev/null; then
    fail "commit estável não encontrado: $STABLE_COMMIT"
  fi

  say "fazendo checkout do commit estável ${STABLE_COMMIT:0:12}"
  git checkout "$STABLE_COMMIT"

  npm ci
  npm run lint
  npm test
  npm run build

  if command -v pm2 >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" || pm2 start npm --name "$APP_NAME" -- start
    pm2 save || true
  else
    fail "pm2 não encontrado. instale pm2 para deploy automático."
  fi

  local ready=false
  for _ in {1..60}; do
    if curl -fsS "http://127.0.0.1:${PORT}${HEALTH_PATH}" >/dev/null; then
      ready=true
      break
    fi
    sleep 1
  done

  [[ "$ready" == true ]] || fail "healthcheck falhou em http://127.0.0.1:${PORT}${HEALTH_PATH}"

  say "deploy OK no commit estável ${STABLE_COMMIT:0:12} ✅"
  trap - ERR
}

rollback() {
  local prev="$1"
  say "falha detectada, rollback para $prev"
  git checkout "$prev" || true
  npm ci || true
  npm run build || true
  pm2 restart "$APP_NAME" || true
  say "rollback concluído"
  exit 1
}

if [[ "$RUN_EVERY_MINUTES" -gt 0 ]]; then
  say "modo daemon: rodando a cada $RUN_EVERY_MINUTES minuto(s)"
  while true; do
    run_once || true
    sleep "$((RUN_EVERY_MINUTES * 60))"
  done
else
  run_once
fi
