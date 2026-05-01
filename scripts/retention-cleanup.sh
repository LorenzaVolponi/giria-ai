#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

DAYS="${RETENTION_DAYS:-90}"

echo "[retention] removendo VisitorEvent com mais de ${DAYS} dias"
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  const cutoff = new Date(Date.now() - Number(process.env.RETENTION_DAYS || 90) * 24 * 60 * 60 * 1000);
  const res = await db.visitorEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });
  console.log(`[retention] removidos: ${res.count}`);
  await db.$disconnect();
})();
NODE
