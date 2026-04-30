#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

AGENTS=(security quality deps autofix)
mkdir -p .agent/reports

for agent in "${AGENTS[@]}"; do
  echo "[orchestrator] executando $agent"
  bash scripts/agents/run-agent.sh "$agent"
done

echo "[orchestrator] resumo"
ls -1t .agent/reports/*.json | head -n 10
