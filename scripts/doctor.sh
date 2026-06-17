#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'USAGE'
Uso: npm run doctor

Valida tudo que precisa para rodar em produção local:
  - comandos obrigatórios
  - node_modules
  - lint
  - testes
  - build standalone
  - smoke HTTP no app standalone
  - npm audit

Variáveis úteis:
  RUN_INSTALL=1   instala dependências com npm ci antes dos checks
  RUN_SMOKE=0     pula o smoke HTTP
  RUN_AUDIT=0     pula npm audit
  RUN_SECURITY=1  roda scripts/security-check.sh
  PORT=3031       muda a porta do smoke
USAGE
  exit 0
fi

RUN_INSTALL="${RUN_INSTALL:-0}"
RUN_AUDIT="${RUN_AUDIT:-1}"
RUN_SMOKE="${RUN_SMOKE:-1}"
RUN_SECURITY="${RUN_SECURITY:-0}"
PORT="${PORT:-3030}"

step() {
  printf '\n[doctor] %s\n' "$1"
}

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[doctor][ERRO] Comando obrigatório não encontrado: $1"
    exit 1
  fi
}

need_command node
need_command npm
need_command curl

step "Ambiente"
node --version
npm --version

if [[ "${RUN_INSTALL}" == "1" ]]; then
  step "Instalando dependências com npm ci"
  npm ci
else
  step "Conferindo node_modules"
  if [[ ! -d node_modules ]]; then
    echo "[doctor][ERRO] node_modules ausente. Rode RUN_INSTALL=1 npm run doctor ou npm ci."
    exit 1
  fi
fi

step "Lint"
npm run lint

step "Testes"
npm test -- --run

step "Build standalone"
npm run build

if [[ "${RUN_SMOKE}" == "1" ]]; then
  step "Smoke de produção"
  PORT="${PORT}" bash scripts/production-smoke.sh
else
  echo "[doctor] Smoke pulado (RUN_SMOKE=0)."
fi

if [[ "${RUN_AUDIT}" == "1" ]]; then
  step "Auditoria npm"
  npm audit
else
  echo "[doctor] Audit pulado (RUN_AUDIT=0)."
fi

if [[ "${RUN_SECURITY}" == "1" ]]; then
  step "Security check"
  bash scripts/security-check.sh
else
  echo "[doctor] Security check pulado (RUN_SECURITY=0)."
fi

echo "[doctor] Projeto pronto para rodar ✅"
