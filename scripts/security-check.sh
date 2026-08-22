#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[sec] Verificando vazamento de .env no Git..."
if git ls-files | grep -En '^\.env$|^\.env\.local$|^\.env\.production$|^\.env\.development$'; then
  echo "[sec][CRITICO] Arquivo .env sensível versionado no git."; exit 1
fi

echo "[sec] Procurando padrões comuns de secrets em arquivos versionados..."
PATTERN='(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36,}|sk-[A-Za-z0-9]{20,}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)'
FOUND_SECRET=0
while IFS= read -r -d '' file; do
  [[ "$file" == "scripts/security-check.sh" ]] && continue
  if grep -IEn -e "$PATTERN" -- "$file"; then
    FOUND_SECRET=1
  fi
done < <(git ls-files -z)

if [[ "$FOUND_SECRET" -eq 1 ]]; then
  echo "[sec][CRITICO] Possível segredo encontrado."; exit 1
else
  echo "[sec] Nenhum padrão crítico encontrado."
fi

echo "[sec] Checando package.json..."
[[ -f package.json ]] || { echo "package.json ausente"; exit 1; }
node -e 'const p=require("./package.json"); if(!p.scripts?.build) process.exit(1)' || { echo "[sec][CRITICO] script build ausente"; exit 1; }

echo "[sec] npm audit (high+ bloqueia o gate; exceções explícitas são verificadas por advisory)..."
AUDIT_FILE="$(mktemp)"
trap 'rm -f "$AUDIT_FILE"' EXIT
set +e
npm audit --json > "$AUDIT_FILE"
AUDIT_EXIT=$?
set -e

node - "$AUDIT_FILE" <<'NODE'
const fs = require("fs");
const path = process.argv[2];
const report = JSON.parse(fs.readFileSync(path, "utf8"));
const blockingSeverities = new Set(["high", "critical"]);
const allowlistedAdvisories = new Set(["GHSA-ggr8-5vv4-36mx"]);
const blocking = [];

for (const [name, vuln] of Object.entries(report.vulnerabilities || {})) {
  if (!blockingSeverities.has(vuln.severity)) continue;

  const advisoryIds = (Array.isArray(vuln.via) ? vuln.via : [])
    .filter((item) => item && typeof item === "object")
    .flatMap((item) => {
      const values = [item.url, item.title, item.name, String(item.source || "")].filter(Boolean);
      return values.flatMap((value) => String(value).match(/GHSA-[a-z0-9-]+/gi) || []);
    });

  const isExplicitlyAllowlisted =
    name === "deepmerge-ts" &&
    advisoryIds.length > 0 &&
    advisoryIds.every((id) => allowlistedAdvisories.has(id));

  if (isExplicitlyAllowlisted) {
    console.warn(`[sec][TEMP] Advisory ${[...new Set(advisoryIds)].join(", ")} em ${name} aceito temporariamente: dependência transitiva de @prisma/config; manter acompanhamento até atualização do lockfile.`);
    continue;
  }

  blocking.push(`${name} (${vuln.severity})`);
}

if (blocking.length) {
  console.error(`[sec][CRITICO] Vulnerabilidades high/critical não permitidas: ${blocking.join(", ")}`);
  process.exit(1);
}
NODE

if [[ "$AUDIT_EXIT" -ne 0 ]]; then
  echo "[sec] npm audit reportou findings; somente exceções explícitas e verificadas foram aceitas."
fi

echo "[sec] Vulnerabilidades moderadas devem ser acompanhadas, mas não bloqueiam este gate."
echo "[sec] Recomendações: habilitar Dependabot, revisão periódica de secrets e rotação de chaves."

echo "[sec] Verificando ALLOWED_ORIGIN..."
if [[ -z "${ALLOWED_ORIGIN:-}" ]]; then
  echo "[sec][WARN] ALLOWED_ORIGIN não definido (defina em produção)."
fi
