#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

RUN_BUILD="${RUN_BUILD:-1}"
RUN_SECURITY="${RUN_SECURITY:-0}"
LOG_PREFIX="[quality-local]"

say() { echo "${LOG_PREFIX} $*"; }
fail() { echo "${LOG_PREFIX}[ERRO] $*"; exit 1; }

# Avoid noisy npm warnings from inherited proxy config in local/CI shells.
unset npm_config_http_proxy npm_config_https_proxy

say "Iniciando checks locais..."

if rg -n "^(<<<<<<<|=======|>>>>>>>)" --glob '!package-lock.json' --glob '!bun.lock' . >/dev/null; then
  fail "Marcadores de conflito de merge detectados."
fi

say "1/3 lint"
npm run lint

say "2/3 testes"
npm test

if [[ "${RUN_BUILD}" == "1" ]]; then
  say "3/3 build"
  npm run build
else
  say "3/3 build: pulado (RUN_BUILD=${RUN_BUILD})"
fi

if [[ "${RUN_SECURITY}" == "1" ]]; then
  say "security-check"
  bash scripts/security-check.sh
else
  say "security-check: pulado (RUN_SECURITY=${RUN_SECURITY})"
fi

say "Checks locais concluídos com sucesso ✅"
