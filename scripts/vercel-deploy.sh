#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"/.. 

echo "🚀 [Vercel Deploy] Iniciando deploy automático..."

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "❌ VERCEL_TOKEN não definido"
  exit 1
fi

if [[ -z "${VERCEL_ORG_ID:-}" ]]; then
  echo "❌ VERCEL_ORG_ID não definido"
  exit 1
fi

if [[ -z "${VERCEL_PROJECT_ID:-}" ]]; then
  echo "❌ VERCEL_PROJECT_ID não definido"
  exit 1
fi

echo "📦 Instalando Vercel CLI..."
npm install -g vercel@latest

echo "🔨 Build local para validação..."
npm run build || { echo "❌ Build falhou"; exit 1; }

echo "📍 Detectando ambiente..."
if [[ "${VERCEL_ENV:-production}" == "production" ]]; then
  echo "🚀 Deploy para PRODUÇÃO..."
  vercel deploy \
    --prod \
    --token="$VERCEL_TOKEN" \
    --confirm \
    --message="Auto-deploy: $(date -Iseconds)"
else
  echo "🔄 Deploy para PREVIEW..."
  vercel deploy \
    --token="$VERCEL_TOKEN" \
    --message="Auto-preview: $(date -Iseconds)"
fi

echo "✅ Deploy finalizado!"
echo "🌐 URL: https://giria-ai.vercel.app"
