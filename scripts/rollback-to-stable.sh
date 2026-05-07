#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"/.. 

echo "🔄 [Rollback] Restaurando commit estável 8482de2f..."

STABLE_COMMIT="8482de2f0e053dae166d45b11f362306fcd30739"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BACKUP_TIME=$(date +%Y%m%d-%H%M%S)
ROLLBACK_BACKUP="rollback-backup-$BACKUP_TIME"

echo "💾 Criando backup do estado atual em: $ROLLBACK_BACKUP"
git checkout -b "$ROLLBACK_BACKUP"
git push origin "$ROLLBACK_BACKUP" --force 2>/dev/null || true

git checkout main

echo "🎯 Resetting para commit estável: $STABLE_COMMIT"
git reset --hard "$STABLE_COMMIT"

echo "📤 Pushing para origem..."
git push origin main --force

echo "✅ Rollback completo!"
echo "   Commit estável: $STABLE_COMMIT"
echo "   Backup criado: $ROLLBACK_BACKUP"
echo "   Data: $(date -Iseconds)"

if command -v gh &> /dev/null; then
  echo "🚀 Disparando redeploy via GitHub Actions..."
  gh workflow run deploy-vercel.yml
else
  echo "⚠️  GitHub CLI não disponível. Acione deploy manualmente."
fi
