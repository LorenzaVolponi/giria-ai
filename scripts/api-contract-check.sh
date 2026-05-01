#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

echo "[contract] health check"
HEALTH=$(curl -fsS "$BASE_URL/api/v1/health")
echo "$HEALTH" | jq -e '.status == "ok"' >/dev/null

echo "[contract] translate check"
RESP=$(curl -fsS -X POST "$BASE_URL/api/v1/translate" -H 'content-type: application/json' -d '{"text":"slay"}')
echo "$RESP" | jq -e '.traducaoFormal and .explicacaoContextual and .intencaoSocialEmocional and .nivelInformalidade' >/dev/null

echo "[contract] contrato API v1 válido ✅"
