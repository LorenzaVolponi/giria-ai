#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-3020}"
BASE_URL="http://127.0.0.1:${PORT}"
LOG_FILE="/tmp/giria-no-break-update.log"

echo "[no-break-update] Iniciando gate de atualização segura..."

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[no-break-update][ERRO] Repositório com alterações locais. Commit/stash antes de atualizar."
  git status --short
  exit 1
fi

if rg -n "^(<<<<<<<|=======|>>>>>>>)" --glob '!package-lock.json' . >/dev/null; then
  echo "[no-break-update][ERRO] Marcadores de conflito de merge detectados."
  exit 1
fi

npm ci
npm run lint
npm test
npm run build

echo "[no-break-update] Subindo app em background para smoke test..."
npm run dev -- --port "${PORT}" >"${LOG_FILE}" 2>&1 &
APP_PID=$!
cleanup() { kill "${APP_PID}" >/dev/null 2>&1 || true; }
trap cleanup EXIT

READY=false
for _ in {1..60}; do
  if curl -fsS "${BASE_URL}/api/v1/health" >/dev/null; then
    READY=true
    break
  fi
  sleep 1
done

if [[ "${READY}" != "true" ]]; then
  echo "[no-break-update][ERRO] App não respondeu healthcheck em 60s."
  tail -n 120 "${LOG_FILE}" || true
  exit 1
fi

bash scripts/api-contract-check.sh "${BASE_URL}"

curl -fsS "${BASE_URL}/api/v1/metrics" >/dev/null
curl -fsS "${BASE_URL}/api/v1/visits" >/dev/null

echo "[no-break-update] Gate concluído com sucesso ✅"
