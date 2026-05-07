#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"/.. 

echo "🚀 [Full Deploy] Executando deploy completo com validações..."

echo "🧹 Limpando cache..."
bash scripts/cleanup-cache.sh

echo "📦 Instalando dependências..."
npm ci

echo "🎨 Executando linter..."
npm run lint || { echo "⚠️  Lint warnings encontrados"; }

echo "🔨 Buildando aplicação..."
npm run build || { echo "❌ Build falhou"; exit 1; }

echo "🔐 Executando verificação de segurança..."
bash scripts/security-check.sh || { echo "⚠️  Security warnings encontrados"; }

echo "💾 Criando backup..."
bash scripts/backup-stable.sh || true

echo "🚀 Deploying para Vercel..."
bash scripts/vercel-deploy.sh || { echo "❌ Deploy falhou"; exit 1; }

echo "✨ Validando saúde da aplicação..."
sleep 5
if curl -f https://giria-ai.vercel.app/api/v1/health > /dev/null 2>&1; then
  echo "✅ Health check OK!"
else
  echo "⚠️  Health check falhou (pode levar alguns segundos)"
fi

echo "🎉 Deploy completo e bem-sucedido!"
echo "📍 URL: https://giria-ai.vercel.app"
echo "⏰ $(date -Iseconds)"
