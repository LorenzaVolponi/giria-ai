#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-3210}"
HOST="${HOST:-127.0.0.1}"
BASE_URL="${BASE_URL:-http://${HOST}:${PORT}}"
OUTPUT="${OUTPUT:-reports/mobile-home.png}"
VIEWPORT="${VIEWPORT:-390,844}"
WAIT_MS="${WAIT_MS:-2000}"
INSTALL_SYSTEM_DEPS="${INSTALL_SYSTEM_DEPS:-1}"
LOG_PREFIX="[mobile-ux-snapshot]"
SERVER_PID=""

say() { echo "${LOG_PREFIX} $*"; }
fail() { echo "${LOG_PREFIX}[ERRO] $*"; exit 1; }
cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

unset npm_config_http_proxy npm_config_https_proxy
mkdir -p "$(dirname "${OUTPUT}")"

say "Subindo app em ${BASE_URL}..."
npm run dev -- --hostname "${HOST}" --port "${PORT}" > /tmp/giria-mobile-ux-next.log 2>&1 &
SERVER_PID="$!"

for _ in {1..60}; do
  if curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
  cat /tmp/giria-mobile-ux-next.log || true
  fail "App não respondeu em ${BASE_URL}."
fi

if [[ "${INSTALL_SYSTEM_DEPS}" == "1" ]]; then
  say "Garantindo dependências do Chromium (INSTALL_SYSTEM_DEPS=1)..."
  npx --yes playwright@1.57.0 install-deps chromium >/dev/null
else
  say "Dependências do Chromium: etapa pulada (INSTALL_SYSTEM_DEPS=${INSTALL_SYSTEM_DEPS})"
fi

say "Garantindo Chromium do Playwright..."
npx --yes playwright@1.57.0 install chromium >/dev/null

say "Capturando viewport mobile ${VIEWPORT} em ${OUTPUT}..."
npx --yes playwright@1.57.0 screenshot \
  --wait-for-timeout="${WAIT_MS}" \
  --viewport-size="${VIEWPORT}" \
  "${BASE_URL}" \
  "${OUTPUT}"

say "Screenshot mobile salvo em ${OUTPUT} ✅"
