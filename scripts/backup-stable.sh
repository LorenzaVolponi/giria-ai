#!/usr/bin/env bash
set -euo pipefail

echo "🔐 [BACKUP] Criando backup seguro do commit estável..."
BACKUP_BRANCH="backup/stable-$(date +%Y%m%d-%H%M%S)"
STABLE_COMMIT="8482de2f0e053dae166d45b11f362306fcd30739"

git checkout $STABLE_COMMIT || { echo "❌ Não foi possível fazer checkout do commit"; exit 1; }
git checkout -b $BACKUP_BRANCH
git push origin $BACKUP_BRANCH --force

echo "✅ Backup criado em: $BACKUP_BRANCH"
echo "   Commit: $STABLE_COMMIT"
echo "   Data: $(date -Iseconds)"

git tag -a "stable-$(date +%Y%m%d)" -m "Backup automático - $(date)" || true
git push origin --tags || true

echo "🔐 Backup seguro finalizado!"
