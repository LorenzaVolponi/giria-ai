#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

echo "Checking skew-guard headers on: ${BASE_URL}"

HEADERS=$(curl -sSI -H "Accept: text/html" "$BASE_URL")

echo "$HEADERS" | grep -qi "x-app-version:" || {
  echo "❌ Missing X-App-Version header"
  exit 1
}

echo "✅ Skew-guard headers are present"
