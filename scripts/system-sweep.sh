 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/scripts/system-sweep.sh b/scripts/system-sweep.sh
index 54596a03ebd94505108cda2e66b7f3527e2ecf2f..87891fcab08c2e15655747554f220e0f71cc7a84 100755
--- a/scripts/system-sweep.sh
+++ b/scripts/system-sweep.sh
@@ -20,45 +20,43 @@ npm run lint | tee -a "$REPORT"
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
 
 READY=false
 for i in {1..60}; do
   if curl -fsS http://127.0.0.1:3010/api/v1/health >/dev/null; then
     READY=true
-for i in {1..60}; do
-  if curl -fsS http://127.0.0.1:3010/api/v1/health >/dev/null; then
     break
   fi
   sleep 1
 done
 
 if [[ "$READY" != "true" ]]; then
   echo "Aplicação não iniciou em 60s" | tee -a "$REPORT"
   cat /tmp/giria-dev.log | tee -a "$REPORT"
   exit 1
 fi
 
 bash scripts/api-contract-check.sh http://127.0.0.1:3010 | tee -a "$REPORT"
 curl -fsS http://127.0.0.1:3010/api/v1/metrics | tee -a "$REPORT"
 curl -fsS http://127.0.0.1:3010/api/v1/visits | tee -a "$REPORT"
 
 log "\n## 6) Resultado"
 log "Sweep concluída com sucesso ✅"
 log "Relatório: $REPORT"
 
EOF
)
