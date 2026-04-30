#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DO_COMMIT="${DO_COMMIT:-false}"
COMMIT_MSG="${COMMIT_MSG:-chore: bootstrap, audit and build fixes}"

log() { printf "\n[INFO] %s\n" "$1"; }
warn() { printf "\n[WARN] %s\n" "$1"; }

ensure_file() {
  local file="$1"
  local content="$2"
  if [[ ! -f "$file" ]]; then
    log "Criando arquivo ausente: $file"
    printf "%s\n" "$content" > "$file"
  fi
}

log "1) Verificando estado atual do projeto"
if [[ -d .git ]]; then
  git status --short || true
else
  warn "Repositório Git não encontrado."
fi

if [[ -f package.json ]]; then
  log "Node/npm detectados:"
  node -v
  npm -v
else
  echo "package.json não encontrado. Execute este script na raiz do projeto." >&2
  exit 1
fi

log "2) Instalando dependências"
npm install

log "3) Corrigindo/criando arquivos essenciais"
ensure_file ".gitignore" $'node_modules/\n.next/\n.env.local\n.env\n*.log\n*.tsbuildinfo\n**/*:Zone.Identifier'
ensure_file ".env.example" $'# Copie para .env.local em ambiente de desenvolvimento\n# NEXT_PUBLIC_APP_URL=http://localhost:3000\n# OPENAI_API_KEY='
ensure_file "next-env.d.ts" $'/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.'

if ! node -e 'const p=require("./package.json"); process.exit(p.scripts?.dev&&p.scripts?.build?0:1)'; then
  log "Ajustando scripts básicos no package.json"
  node - <<'NODE'
const fs=require('fs');
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts=p.scripts||{};
if(!p.scripts.dev) p.scripts.dev='next dev';
if(!p.scripts.build) p.scripts.build='next build';
if(!p.scripts.start) p.scripts.start='next start';
if(!p.scripts.lint) p.scripts.lint='eslint .';
fs.writeFileSync('package.json', JSON.stringify(p,null,2)+'\n');
NODE
fi

log "4) Rodando validações"
npm run lint

log "5) Rodando build"
npm run build

log "Resumo final"
if [[ -d .git ]]; then
  git status --short || true
fi

if [[ "$DO_COMMIT" == "true" ]]; then
  if [[ -d .git ]]; then
    log "6) Commit opcional habilitado"
    if [[ -n "$(git status --porcelain)" ]]; then
      git add -A
      git commit -m "$COMMIT_MSG"
      log "Commit criado: $COMMIT_MSG"
    else
      log "Sem alterações para commit."
    fi
  else
    warn "Commit ignorado: pasta .git não encontrada."
  fi
else
  log "6) Commit opcional desabilitado (DO_COMMIT=false)."
fi

log "Concluído com sucesso ✅"
