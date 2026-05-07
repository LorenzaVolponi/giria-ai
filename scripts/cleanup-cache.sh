#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"/.. 

echo "🧹 [Cleanup] Limpando cache e arquivos temporários..."

echo "📁 Removendo .next..."
rm -rf .next/

echo "📦 Removendo dependências instaladas..."
rm -rf node_modules/

echo "🗂️  Removendo arquivos de build..."
rm -f *.tsbuildinfo
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

echo "📋 Removendo logs..."
rm -f *.log
find . -name "*.log" -delete 2>/dev/null || true

if [ -d ".agent/reports" ]; then
  find .agent/reports -type f -mtime +7 -delete 2>/dev/null || true
fi

echo "⚡ Removendo .vercel..."
rm -rf .vercel/

echo "✅ Cleanup completo!"
echo "   Agora execute: npm install && npm run build"
