#!/usr/bin/env bash
set -euo pipefail

# Restaura o repositório para o estado imediatamente após a PR #5.
# Isso remove, no histórico local atual, tudo da PR #6 em diante.
#
# Uso:
#   scripts/reset-from-pr6.sh            # executa reset hard + clean
#   scripts/reset-from-pr6.sh --dry-run  # apenas mostra o que será feito
#
# Observação: para refletir no remoto, será necessário push forçado.

TARGET_COMMIT="2f428f9"
TARGET_LABEL="Merge pull request #5"
DRY_RUN="false"

if (( $# > 1 )); then
  echo "Erro: argumento(s) não suportado(s): $*"
  echo "Uso: scripts/reset-from-pr6.sh [--dry-run]"
  exit 1
fi

case "${1:-}" in
  "")
    ;;
  --dry-run)
    DRY_RUN="true"
    ;;
  *)
    echo "Erro: argumento não suportado: $1"
    echo "Uso: scripts/reset-from-pr6.sh [--dry-run]"
    exit 1
    ;;
esac

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erro: execute este script dentro de um repositório git."
  exit 1
fi

if ! git cat-file -e "${TARGET_COMMIT}^{commit}" 2>/dev/null; then
  echo "Erro: commit alvo ${TARGET_COMMIT} não encontrado neste repositório."
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
CURRENT_HEAD="$(git rev-parse --short HEAD)"

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "[DRY-RUN] Branch atual: ${CURRENT_BRANCH}"
  echo "[DRY-RUN] HEAD atual: ${CURRENT_HEAD}"
  echo "[DRY-RUN] Alvo: ${TARGET_COMMIT} (${TARGET_LABEL})"
  echo "[DRY-RUN] Commits que serão removidos do histórico da branch atual:"
  git --no-pager log --oneline "${TARGET_COMMIT}..HEAD" || true
  echo "[DRY-RUN] Comando que seria executado:"
  echo "git reset --hard ${TARGET_COMMIT}"
  echo "git clean -fd"
  exit 0
fi

echo "Branch atual: ${CURRENT_BRANCH}"
echo "HEAD atual: ${CURRENT_HEAD}"
echo "Resetando para: ${TARGET_COMMIT} (${TARGET_LABEL})"

git reset --hard "${TARGET_COMMIT}"
git clean -fd

echo "Concluído. Novo HEAD: $(git rev-parse --short HEAD)"
echo "Se quiser atualizar o remoto: git push --force-with-lease origin ${CURRENT_BRANCH}"
