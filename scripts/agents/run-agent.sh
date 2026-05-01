#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

AGENT="${1:-}"
[[ -n "$AGENT" ]] || { echo "Uso: bash scripts/agents/run-agent.sh <security|backend|quality|deps|autofix>"; exit 1; }

REPORT_DIR=".agent/reports"
mkdir -p "$REPORT_DIR"
OUT="$REPORT_DIR/${AGENT}-$(date +%Y%m%d%H%M%S).json"
STATUS="pass"
NOTES=()

run() { "$@" || return 1; }

case "$AGENT" in
  security)
    if ! bash scripts/security-check.sh; then STATUS="fail"; NOTES+=("security-check failed"); fi
    ;;
  backend)
    if ! curl -fsS http://localhost:3000/api/v1/health >/dev/null 2>&1; then
      NOTES+=("health endpoint not reachable (run dev server for full check)")
      STATUS="warn"
    fi
    ;;
  quality)
    if ! npm run lint; then STATUS="fail"; NOTES+=("lint failed"); fi
    if ! npm run build; then STATUS="fail"; NOTES+=("build failed"); fi
    ;;
  deps)
    if ! npm outdated >/tmp/npm-outdated.txt 2>/dev/null; then
      NOTES+=("dependencies outdated (see npm outdated)")
      [[ "$STATUS" == "pass" ]] && STATUS="warn"
    fi
    ;;
  autofix)
    if npm run lint -- --fix; then NOTES+=("lint --fix applied when possible"); else STATUS="warn"; NOTES+=("lint --fix had issues"); fi
    ;;
  *)
    echo "Agente inválido: $AGENT"; exit 1
    ;;
esac

printf '{"agent":"%s","status":"%s","notes":%s,"timestamp":"%s"}\n' \
  "$AGENT" "$STATUS" "$(printf '%s\n' "${NOTES[@]-}" | jq -R -s 'split("\n")[:-1]')" "$(date -Iseconds)" > "$OUT"

echo "[agent] relatório salvo em $OUT"
