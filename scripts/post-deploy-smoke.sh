#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${BASE_URL:-https://giria-ai.vercel.app}}"
BASE_URL="${BASE_URL%/}"
ADMIN_API_TOKEN="${ADMIN_API_TOKEN:-}"
EXPECTED_COMMIT_SHA="${EXPECTED_COMMIT_SHA:-}"

CURL_RETRY=(--retry 12 --retry-delay 5 --retry-all-errors --connect-timeout 10 --max-time 30)

echo "[smoke] Base URL: $BASE_URL"

check_release_commit() {
  if [[ -z "$EXPECTED_COMMIT_SHA" ]]; then
    echo "⚠️ EXPECTED_COMMIT_SHA não definido: pulando check de release"
    return 0
  fi

  local expected="${EXPECTED_COMMIT_SHA:0:12}"
  local body actual

  for attempt in $(seq 1 18); do
    body="$(curl -fsS --connect-timeout 10 --max-time 20 "$BASE_URL/api/v1/health" 2>/dev/null || true)"
    actual="$(printf '%s' "$body" | node -e 'let input=""; process.stdin.on("data", c => input += c); process.stdin.on("end", () => { try { process.stdout.write(JSON.parse(input).commit || ""); } catch {} });')"

    if [[ "$actual" == "$expected" ]]; then
      echo "✅ release $expected live"
      return 0
    fi

    echo "[smoke] aguardando release $expected (atual: ${actual:-indisponivel})"
    sleep 10
  done

  echo "❌ produção não chegou ao commit $expected"
  return 1
}

check_url() {
  local path="$1"
  curl -fsS "${CURL_RETRY[@]}" "$BASE_URL$path" >/dev/null
  echo "✅ $path ok"
}

check_release_commit
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
