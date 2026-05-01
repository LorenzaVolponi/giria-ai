#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${VERCEL_TOKEN:-}" || -z "${VERCEL_ORG_ID:-}" || -z "${VERCEL_PROJECT_ID:-}" ]]; then
  echo "[vercel-safe-deploy] Secrets ausentes. Pulando deploy." >&2
  exit 0
fi

max_attempts=3
attempt=1

npm i -g vercel >/dev/null 2>&1

while [[ $attempt -le $max_attempts ]]; do
  echo "[vercel-safe-deploy] Tentativa ${attempt}/${max_attempts}..."
  set +e
  output=$(vercel deploy --prod --yes --token "$VERCEL_TOKEN" 2>&1)
  code=$?
  set -e

  if [[ $code -eq 0 ]]; then
    echo "$output"
    echo "[vercel-safe-deploy] Deploy concluído com sucesso."
    exit 0
  fi

  if echo "$output" | grep -qi "rate limit\|deployment rate limited\|retry in"; then
    echo "[vercel-safe-deploy] Rate limit detectado. Não quebrando pipeline."
    echo "$output"
    exit 0
  fi

  echo "$output"
  if [[ $attempt -lt $max_attempts ]]; then
    sleep $((attempt * 20))
  fi
  attempt=$((attempt + 1))
done

echo "[vercel-safe-deploy] Falha real de deploy após retries." >&2
exit 1
