#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-3020}"
STRICT_GIT_CLEAN="${STRICT_GIT_CLEAN:-1}"

say() { echo "[no-break-update] $*"; }
fail() { echo "[no-break-update][ERRO] $*"; exit 1; }

say "Iniciando gate de atualização segura..."

# Evita warning do npm sobre chaves de config legadas via env.
unset npm_config_http_proxy npm_config_https_proxy

if [[ "${STRICT_GIT_CLEAN}" == "1" && -n "$(git status --porcelain)" ]]; then
  git status --short
  fail "Repositório com alterações locais. Commit/stash antes de atualizar."
elif [[ "${STRICT_GIT_CLEAN}" != "1" ]]; then
  say "STRICT_GIT_CLEAN=${STRICT_GIT_CLEAN}: ignorando working tree suja."
fi

if rg -n "^(<<<<<<<|=======|>>>>>>>)" --glob '!package-lock.json' --glob '!bun.lock' . >/dev/null; then
  fail "Marcadores de conflito de merge detectados."
fi

npm ci
npm run lint
npm test
npm run build
PORT="${PORT}" npm run smoke
bash scripts/security-check.sh

if [[ "${STRICT_GIT_CLEAN}" == "1" && -n "$(git status --porcelain)" ]]; then
  git status --short
  fail "Após checks, o repositório ficou com alterações locais."
fi

say "Gate concluído com sucesso ✅"
