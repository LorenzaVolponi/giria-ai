#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

REPORT="reports/system-sweep-$(date +%Y%m%d-%H%M%S).md"
mkdir -p reports

log() { echo "$1" | tee -a "$REPORT"; }

log "# System Sweep"
log "Data: $(date -Iseconds)"

log "\n## 1) Dependências e ambiente"
node -v | tee -a "$REPORT"
npm -v | tee -a "$REPORT"
npm install | tee -a "$REPORT"

log "\n## 2) Checks de qualidade"
npm run lint | tee -a "$REPORT"
npm run build | tee -a "$REPORT"

log "\n## 3) Segurança"
bash scripts/security-check.sh | tee -a "$REPORT"

log "\n## 4) Verificação de workflows críticos"
for f in .github/workflows/ci.yml .github/workflows/security.yml .github/workflows/post-deploy-smoke.yml .github/workflows/auto-fix-and-merge.yml; do
  if [[ -f "$f" ]]; then
    log "OK: $f"
  else
    log "FALTA: $f"
    exit 1
  fi
done

log "\n## 5) Contrato de API e endpoints"
PORT=3010 npm run dev -- --port 3010 > /tmp/giria-dev.log 2>&1 &
DEV_PID=$!
cleanup() { kill $DEV_PID >/dev/null 2>&1 || true; }
trap cleanup EXIT

for i in {1..60}; do
  if curl -fsS http://127.0.0.1:3010/api/v1/health >/dev/null; then
    break
  fi
  sleep 1
done

bash scripts/api-contract-check.sh http://127.0.0.1:3010 | tee -a "$REPORT"
curl -fsS http://127.0.0.1:3010/api/v1/metrics | tee -a "$REPORT"
curl -fsS http://127.0.0.1:3010/api/v1/visits | tee -a "$REPORT"

log "\n## 6) Resultado"
log "Sweep concluída com sucesso ✅"
log "Relatório: $REPORT"
