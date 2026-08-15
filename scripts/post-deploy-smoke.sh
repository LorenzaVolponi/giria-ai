#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${BASE_URL:-https://giria-ai.vercel.app}}"
BASE_URL="${BASE_URL%/}"
ADMIN_API_TOKEN="${ADMIN_API_TOKEN:-}"

CURL_RETRY=(--retry 12 --retry-delay 5 --retry-all-errors --connect-timeout 10 --max-time 30)

echo "[smoke] Base URL: $BASE_URL"

check_url() {
  local path="$1"
  curl -fsS "${CURL_RETRY[@]}" "$BASE_URL$path" >/dev/null
  echo "✅ $path ok"
}

check_url "/"
check_url "/api/v1/health"
check_url "/robots.txt"
check_url "/sitemap.xml"
check_url "/llms.txt"
check_url "/editorial-index.json"
check_url "/seo-index.json"
check_url "/girias"
check_url "/o-que-significa"
check_url "/o-que-significa/farmar%20aura"
check_url "/o-que-significa/six%20seven"
check_url "/guias"
check_url "/observatorio"
check_url "/observatorio/dados.json"
check_url "/imprensa"
check_url "/sobre"

curl -fsS "${CURL_RETRY[@]}" -X POST "$BASE_URL/api/v1/translate" \
  -H 'content-type: application/json' \
  -d '{"text":"slay"}' >/dev/null
echo "✅ translate ok"

curl -fsS "${CURL_RETRY[@]}" "$BASE_URL/api/v1/suggestions?status=approved&limit=1" >/dev/null
echo "✅ suggestions list ok"

if [[ -n "$ADMIN_API_TOKEN" ]]; then
  curl -fsS "${CURL_RETRY[@]}" "$BASE_URL/api/v1/metrics" -H "x-admin-token: $ADMIN_API_TOKEN" >/dev/null
  echo "✅ admin metrics ok"
else
  echo "⚠️ ADMIN_API_TOKEN não definido: pulando check admin"
fi

echo "[smoke] all public authority surfaces are healthy"
