#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

STABLE_COMMIT="${STABLE_COMMIT:-2f428f91e31f84779b5b8ca7296abd03300e8a96}"
BACKUP_BRANCH="backup-before-restore-$(date +%Y%m%d-%H%M%S)"

echo "[restore-stable] Commit estável alvo: ${STABLE_COMMIT}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[restore-stable][ERRO] Execute dentro de um repositório git."
  exit 1
fi

if ! git cat-file -e "${STABLE_COMMIT}^{commit}" 2>/dev/null; then
  echo "[restore-stable][ERRO] Commit estável não encontrado localmente: ${STABLE_COMMIT}"
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
CURRENT_SHA="$(git rev-parse --short HEAD)"

echo "[restore-stable] Branch atual: ${CURRENT_BRANCH} (${CURRENT_SHA})"
echo "[restore-stable] Criando backup: ${BACKUP_BRANCH}"
git branch "${BACKUP_BRANCH}"

echo "[restore-stable] Resetando branch ${CURRENT_BRANCH} para commit estável..."
git reset --hard "${STABLE_COMMIT}"

echo "[restore-stable] Limpando artefatos não rastreados..."
git clean -fd

echo "[restore-stable] Reinstalando dependências e validando build..."
unset npm_config_http_proxy npm_config_https_proxy
npm ci
npm run lint
npm test
npm run build

echo "[restore-stable] ✅ Recuperação concluída."
echo "[restore-stable] Backup salvo em: ${BACKUP_BRANCH}"
