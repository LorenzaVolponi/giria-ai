#!/usr/bin/env bash
set -euo pipefail

# Reset total do histórico para recomeçar a partir da PR #5.
# Remove TUDO da PR #6 em diante na branch escolhida e pode forçar no remoto.
#
# Uso:
#   scripts/reset-from-pr6.sh --dry-run
#   scripts/reset-from-pr6.sh --yes
#   scripts/reset-from-pr6.sh --yes --branch main --push
#
# Flags:
#   --dry-run   mostra o que será feito sem aplicar
#   --yes       confirma execução destrutiva
#   --branch X  branch alvo (padrão: branch atual)
#   --push      faz push forçado para origin/<branch>

TARGET_COMMIT="2f428f9"
TARGET_LABEL="Merge pull request #5"
DRY_RUN="false"
CONFIRMED="false"
PUSH_REMOTE="false"
TARGET_BRANCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --yes)
      CONFIRMED="true"
      shift
      ;;
    --push)
      PUSH_REMOTE="true"
      shift
      ;;
    --branch)
      TARGET_BRANCH="${2:-}"
      if [[ -z "${TARGET_BRANCH}" ]]; then
        echo "Erro: use --branch <nome-da-branch>."
        exit 1
      fi
      shift 2
      ;;
    *)
      echo "Flag desconhecida: $1"
      exit 1
      ;;
  esac
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erro: execute este script dentro de um repositório git."
  exit 1
fi

if ! git cat-file -e "${TARGET_COMMIT}^{commit}" 2>/dev/null; then
  echo "Erro: commit alvo ${TARGET_COMMIT} não encontrado neste repositório."
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ -z "${TARGET_BRANCH}" ]]; then
  TARGET_BRANCH="${CURRENT_BRANCH}"
fi

CURRENT_HEAD="$(git rev-parse --short HEAD)"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
BACKUP_BRANCH="backup/pre-reset-${TIMESTAMP}"

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "[DRY-RUN] Branch atual: ${CURRENT_BRANCH}"
  echo "[DRY-RUN] Branch alvo: ${TARGET_BRANCH}"
  echo "[DRY-RUN] HEAD atual: ${CURRENT_HEAD}"
  echo "[DRY-RUN] Alvo: ${TARGET_COMMIT} (${TARGET_LABEL})"
  echo "[DRY-RUN] Backup local que seria criado: ${BACKUP_BRANCH}"
  echo "[DRY-RUN] Commits da PR #6 em diante que serão apagados da branch alvo:"
  git --no-pager log --oneline "${TARGET_COMMIT}..${TARGET_BRANCH}" || true
  echo "[DRY-RUN] Comandos que seriam executados:"
  echo "git branch ${BACKUP_BRANCH} ${TARGET_BRANCH}"
  echo "git checkout ${TARGET_BRANCH}"
  echo "git reset --hard ${TARGET_COMMIT}"
  echo "git clean -fdx"
  if [[ "${PUSH_REMOTE}" == "true" ]]; then
    echo "git push --force-with-lease origin ${TARGET_BRANCH}"
  fi
  exit 0
fi

if [[ "${CONFIRMED}" != "true" ]]; then
  echo "Erro: operação destrutiva bloqueada. Use --yes para confirmar."
  exit 1
fi

if [[ "${TARGET_BRANCH}" != "${CURRENT_BRANCH}" ]]; then
  git checkout "${TARGET_BRANCH}"
fi

echo "Criando backup local da branch antes do reset: ${BACKUP_BRANCH}"
git branch "${BACKUP_BRANCH}" "${TARGET_BRANCH}"

echo "Resetando ${TARGET_BRANCH} para ${TARGET_COMMIT} (${TARGET_LABEL})"
git reset --hard "${TARGET_COMMIT}"
git clean -fdx

echo "Concluído. Novo HEAD: $(git rev-parse --short HEAD)"
echo "Backup disponível em: ${BACKUP_BRANCH}"

if [[ "${PUSH_REMOTE}" == "true" ]]; then
  echo "Forçando remoto origin/${TARGET_BRANCH} para PR #5..."
  git push --force-with-lease origin "${TARGET_BRANCH}"
  echo "Remoto atualizado."
else
  echo "Para apagar também no remoto: git push --force-with-lease origin ${TARGET_BRANCH}"
fi
