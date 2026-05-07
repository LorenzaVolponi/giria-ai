#!/usr/bin/env bash
set -euo pipefail

required=(DATABASE_URL ADMIN_API_TOKEN)
optional=(SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS SMTP_FROM OLLAMA_URL OLLAMA_MODEL NEXT_PUBLIC_ENABLE_MODERATION_PANEL)

missing=()
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    missing+=("$key")
  fi
done

echo "[preflight] Required env vars"
for key in "${required[@]}"; do
  if [[ -n "${!key:-}" ]]; then
    echo "  ✅ $key"
  else
    echo "  ❌ $key"
  fi
done

echo "[preflight] Optional env vars"
for key in "${optional[@]}"; do
  if [[ -n "${!key:-}" ]]; then
    echo "  ✅ $key"
  else
    echo "  ⚠️  $key (not set)"
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "\n[preflight] Missing required vars: ${missing[*]}"
  exit 1
fi

echo "\n[preflight] Running tests and build..."
npm test
npm run build

echo "\n[preflight] OK for deploy"
