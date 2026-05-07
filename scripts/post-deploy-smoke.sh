#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${BASE_URL:-https://example.com}}"
ADMIN_API_TOKEN="${ADMIN_API_TOKEN:-}"

echo "[smoke] Base URL: $BASE_URL"

curl -fsS "$BASE_URL/api/v1/health" >/dev/null
echo "✅ health ok"

curl -fsS -X POST "$BASE_URL/api/v1/translate" \
  -H 'content-type: application/json' \
  -d '{"text":"slay"}' >/dev/null
echo "✅ translate ok"

curl -fsS "$BASE_URL/api/v1/suggestions?status=approved&limit=1" >/dev/null
echo "✅ suggestions list ok"

if [[ -n "$ADMIN_API_TOKEN" ]]; then
  curl -fsS "$BASE_URL/api/v1/metrics" -H "x-admin-token: $ADMIN_API_TOKEN" >/dev/null
  echo "✅ admin metrics ok"
else
  echo "⚠️  ADMIN_API_TOKEN não definido: pulando check admin"
fi

echo "[smoke] done"
