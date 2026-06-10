#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-3030}"
HOST="${HOST:-127.0.0.1}"
BASE_URL="${BASE_URL:-http://${HOST}:${PORT}}"
LOG_FILE="${LOG_FILE:-/tmp/giria-production-smoke-${PORT}.log}"

if [[ ! -f .next/standalone/server.js ]]; then
  echo "[production-smoke][ERRO] .next/standalone/server.js não encontrado. Rode npm run build antes do smoke."
  exit 1
fi

if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[production-smoke][ERRO] Porta ${PORT} já está em uso. Defina PORT=<porta-livre>."
  exit 1
fi

echo "[production-smoke] Subindo standalone em ${BASE_URL}..."
PORT="${PORT}" HOSTNAME="0.0.0.0" node .next/standalone/server.js >"${LOG_FILE}" 2>&1 &
APP_PID=$!
cleanup() {
  kill "${APP_PID}" >/dev/null 2>&1 || true
  wait "${APP_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

READY=false
for i in {1..60}; do
  if curl -fsS "${BASE_URL}/api/v1/health" >/dev/null 2>&1; then
    READY=true
    break
  fi
  if ! kill -0 "${APP_PID}" >/dev/null 2>&1; then
    echo "[production-smoke][ERRO] Servidor encerrou antes do healthcheck. Log:"
    tail -n 120 "${LOG_FILE}" || true
    exit 1
  fi
  if (( i == 1 || i % 10 == 0 )); then
    echo "[production-smoke] Aguardando app iniciar (${i}/60)..."
  fi
  sleep 1
done

if [[ "${READY}" != "true" ]]; then
  echo "[production-smoke][ERRO] App não respondeu healthcheck em 60s. Log:"
  tail -n 120 "${LOG_FILE}" || true
  exit 1
fi

curl -fsS "${BASE_URL}/" >/dev/null
echo "[production-smoke] Home OK"

bash scripts/api-contract-check.sh "${BASE_URL}"

if [[ -n "${ADMIN_API_TOKEN:-}" ]]; then
  curl -fsS "${BASE_URL}/api/v1/metrics" -H "x-admin-token: ${ADMIN_API_TOKEN}" >/dev/null
  echo "[production-smoke] Metrics autenticado OK"
else
  METRICS_STATUS=$(curl -sS -o /dev/null -w '%{http_code}' "${BASE_URL}/api/v1/metrics")
  if [[ "${METRICS_STATUS}" != "401" ]]; then
    echo "[production-smoke][ERRO] /api/v1/metrics sem token retornou ${METRICS_STATUS}; esperado 401."
    exit 1
  fi
  echo "[production-smoke] Metrics protegido OK (401 sem token)"
fi

curl -fsS "${BASE_URL}/api/v1/visits" >/dev/null
echo "[production-smoke] Visits OK"

echo "[production-smoke] Smoke de produção concluído ✅"
