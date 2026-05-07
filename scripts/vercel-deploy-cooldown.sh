#!/usr/bin/env bash
set -euo pipefail

COOLDOWN_MINUTES="${VERCEL_DEPLOY_COOLDOWN_MINUTES:-60}"

if [[ -z "${GITHUB_TOKEN:-}" || -z "${GITHUB_REPOSITORY:-}" || -z "${GITHUB_WORKFLOW:-}" ]]; then
  echo "[vercel-cooldown] Contexto GitHub ausente. Seguindo sem cooldown."
  exit 0
fi

api_url="https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/workflows/merge-conflicts-and-deploy.yml/runs?status=success&per_page=1"
json=$(curl -fsSL -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "$api_url")

last_time=$(python - <<'PY' "$json"
import json,sys
obj=json.loads(sys.argv[1])
runs=obj.get('workflow_runs',[])
print(runs[0]['updated_at'] if runs else '')
PY
)

if [[ -z "$last_time" ]]; then
  echo "[vercel-cooldown] Sem execução prévia. Deploy permitido."
  exit 0
fi

now_epoch=$(date -u +%s)
last_epoch=$(date -u -d "$last_time" +%s)
diff_min=$(( (now_epoch - last_epoch) / 60 ))

if (( diff_min < COOLDOWN_MINUTES )); then
  msg="[vercel-cooldown] Cooldown ativo (${diff_min}m < ${COOLDOWN_MINUTES}m). Pulando deploy."
  echo "$msg"
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    {
      echo "### Vercel Deploy Cooldown"
      echo "- Status: ⏭️ pulado por cooldown"
      echo "- Janela configurada: ${COOLDOWN_MINUTES} minutos"
      echo "- Último deploy/sucesso: ${diff_min} minutos atrás"
    } >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 78
fi

ok_msg="[vercel-cooldown] Cooldown ok (${diff_min}m). Deploy permitido."
echo "$ok_msg"
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### Vercel Deploy Cooldown"
    echo "- Status: ✅ deploy permitido"
    echo "- Janela configurada: ${COOLDOWN_MINUTES} minutos"
    echo "- Último deploy/sucesso: ${diff_min} minutos atrás"
  } >> "$GITHUB_STEP_SUMMARY"
fi
