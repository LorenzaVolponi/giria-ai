#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[sec] Verificando vazamento de .env no Git..."
if git ls-files | rg -n "^\.env$|^\.env\.local$|^\.env\.production$|^\.env\.development$"; then
  echo "[sec][CRITICO] Arquivo .env sensível versionado no git."; exit 1
fi

echo "[sec] Procurando padrões comuns de secrets..."
PATTERN='(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36,}|sk-[A-Za-z0-9]{20,}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)'
if rg -n --hidden -g "!node_modules" -g "!.next" -e "$PATTERN" .; then
  echo "[sec][CRITICO] Possível segredo encontrado."; exit 1
else
  echo "[sec] Nenhum padrão crítico encontrado."
fi

echo "[sec] Checando package.json..."
[[ -f package.json ]] || { echo "package.json ausente"; exit 1; }
node -e 'const p=require("./package.json"); if(!p.scripts?.build) process.exit(1)' || { echo "[sec][CRITICO] script build ausente"; exit 1; }

echo "[sec] npm audit (sem quebrar por moderadas)..."
set +e
npm audit --audit-level=high
AUDIT_EXIT=$?
set -e
if [[ $AUDIT_EXIT -ne 0 ]]; then
  echo "[sec][WARN] Foram encontrados achados high/critical. Revise npm audit.";
fi

echo "[sec] Recomendações: habilitar Dependabot, revisão periódica de secrets e rotação de chaves."
