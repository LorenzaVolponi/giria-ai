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


if [[ "${AUTO_COMMIT:-false}" == "true" ]] && [[ -n "$(git status --porcelain)" ]]; then
  echo "[orchestrator] AUTO_COMMIT habilitado: criando commit automático"
  git add -A
  git commit -m "chore: ajustes automáticos do orquestrador" || true
fi
