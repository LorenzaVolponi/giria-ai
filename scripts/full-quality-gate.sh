#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-3030}"
RUN_SWEEP="${RUN_SWEEP:-1}"
RUN_RELEASE_GUARD="${RUN_RELEASE_GUARD:-1}"
LOG_PREFIX="[full-quality-gate]"

say() { echo "${LOG_PREFIX} $*"; }

say "Iniciando validação completa anti-regressão..."

if [[ ! -x scripts/no-break-update.sh ]]; then
  echo "${LOG_PREFIX} ERRO: scripts/no-break-update.sh não encontrado/executável."
  exit 1
fi

say "1/3 no-break-update (lint/test/build + smoke + contrato)"
PORT="${PORT}" bash scripts/no-break-update.sh

if [[ "${RUN_SWEEP}" == "1" ]]; then
  if [[ ! -x scripts/system-sweep.sh ]]; then
    echo "${LOG_PREFIX} ERRO: scripts/system-sweep.sh não encontrado/executável."
    exit 1
  fi
  say "2/3 system-sweep (checagem ampla + relatório)"
  bash scripts/system-sweep.sh
else
  say "2/3 system-sweep: pulado (RUN_SWEEP=${RUN_SWEEP})"
fi

if [[ "${RUN_RELEASE_GUARD}" == "1" ]]; then
  if [[ ! -x scripts/release-guard.sh ]]; then
    echo "${LOG_PREFIX} ERRO: scripts/release-guard.sh não encontrado/executável."
    exit 1
  fi
  say "3/3 release-guard (gate final de release)"
  bash scripts/release-guard.sh
else
  say "3/3 release-guard: pulado (RUN_RELEASE_GUARD=${RUN_RELEASE_GUARD})"
fi

say "Validação completa concluída com sucesso ✅"
