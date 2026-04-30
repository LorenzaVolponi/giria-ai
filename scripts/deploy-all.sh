#!/usr/bin/env bash

set -euo pipefail

log() {
  printf '[INFO] %s\n' "$1"
}

warn() {
  printf '[WARN] %s\n' "$1"
}

error() {
  printf '[ERROR] %s\n' "$1" >&2
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

has_npm_script() {
  local script_name="$1"
  npm run "$script_name" --silent >/dev/null 2>&1
}

log 'Iniciando deploy automatizado...'

log 'Validando ambiente...'
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  error 'Este diretório não está dentro de um repositório Git.'
  exit 1
fi

if ! command_exists node; then
  error 'Node.js não encontrado. Instale Node.js para continuar.'
  exit 1
fi

if ! command_exists npm; then
  error 'npm não encontrado. Instale npm para continuar.'
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ -z "$CURRENT_BRANCH" ]]; then
  error 'Não foi possível identificar a branch atual.'
  exit 1
fi
log "Branch atual: ${CURRENT_BRANCH}"

if ! git remote get-url origin >/dev/null 2>&1; then
  error 'Remote origin não está configurado.'
  exit 1
fi
log 'Remote origin detectado.'

if [[ "$CURRENT_BRANCH" != "main" ]]; then
  warn "Você está na branch '${CURRENT_BRANCH}'. O push será feito para 'main'."
fi

log 'Validando projeto...'
log 'Executando npm install...'
npm install

if has_npm_script lint; then
  log 'Executando npm run lint...'
  npm run lint
else
  warn 'Script de lint não encontrado. Etapa ignorada.'
fi

log 'Executando npm run build...'
npm run build

if has_npm_script test; then
  log 'Executando npm run test...'
  npm run test
else
  warn 'Script de teste não encontrado. Etapa ignorada.'
fi

log 'Executando verificações de segurança...'
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  error '.env está versionado no Git. Remova do versionamento antes do deploy.'
  exit 1
fi

if [[ -f scripts/security-check.sh ]]; then
  log 'Executando scripts/security-check.sh...'
  bash scripts/security-check.sh
else
  warn 'scripts/security-check.sh não encontrado. Etapa ignorada.'
fi

secret_scan_patterns='(API[_-]?KEY|SECRET|TOKEN|PRIVATE[_-]?KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|BEGIN[[:space:]]+RSA[[:space:]]+PRIVATE[[:space:]]+KEY)'
if git diff --cached --name-only | grep -q '.'; then
  :
fi

if git diff -- . ':!package-lock.json' | grep -Eiq "$secret_scan_patterns"; then
  error 'Foram encontrados possíveis secrets críticos nas alterações locais. Deploy bloqueado.'
  exit 1
fi

log 'Iniciando fluxo Git automático...'
git status

git add .

if git diff --cached --quiet; then
  warn 'Nenhuma alteração detectada para commit.'
else
  log 'Criando commit automático...'
  git commit -m 'chore: deploy automated update'
fi

log 'Sincronizando com origin/main (rebase)...'
git pull --rebase origin main

log 'Enviando alterações para origin/main...'
git push origin main

log 'Preparando deploy...'
if command_exists vercel; then
  read -r -p 'Vercel CLI detectada. Deseja executar "vercel --prod" agora? (s/N): ' run_vercel
  if [[ "${run_vercel:-N}" =~ ^[sSyY]$ ]]; then
    vercel --prod
  else
    log 'Deploy via Vercel CLI ignorado. O deploy automático via GitHub/Vercel continuará após o push.'
  fi
else
  log 'Vercel CLI não encontrada. O deploy será realizado automaticamente pela integração GitHub/Vercel.'
fi

log 'Fluxo finalizado com sucesso.'
