#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[rollback] Procedimento semiautomático"

git rev-parse --is-inside-work-tree >/dev/null

echo "[rollback] Commits recentes:"
git --no-pager log --oneline -n 10

read -r -p "Hash do commit estável para rollback: " TARGET
[[ -n "$TARGET" ]] || { echo "Hash obrigatório"; exit 1; }

read -r -p "Confirmar reset hard para $TARGET? (y/N) " CONFIRM
if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
  git reset --hard "$TARGET"
  echo "[rollback] Repositório retornou para $TARGET"
else
  echo "[rollback] Operação cancelada"
fi
