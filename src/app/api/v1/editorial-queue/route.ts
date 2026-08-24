import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminToken } from "@/lib/admin-guard";
import { getEvidenceFlywheelSnapshot } from "@/lib/evidence-flywheel";
import { getDurableGeoSignals } from "@/lib/geo-signal-store";
import { getEditorialWorkflowSnapshot, setEditorialWorkflowState } from "@/lib/editorial-lifecycle";

const stateSchema = z.object({
  key: z.string().trim().min(1).max(180),
  status: z.enum(["discovered", "researching", "reviewed", "dismissed"]),
  note: z.string().trim().max(500).optional(),
  actor: z.string().trim().max(120).optional(),
});

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const [signals, workflow] = await Promise.all([
    getDurableGeoSignals(250),
    getEditorialWorkflowSnapshot(500),
  ]);

  return NextResponse.json({
    ...getEvidenceFlywheelSnapshot(),
    durableSignals: {
      backend: signals.backend,
      durable: signals.durable,
      count: signals.events.length,
      latest: signals.events.slice(0, 50),
    },
    workflow,
  }, {
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const parsed = stateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Estado editorial inválido." }, { status: 400 });

  const persistence = await setEditorialWorkflowState(parsed.data);
  return NextResponse.json({
    accepted: true,
    workflow: parsed.data,
    persistence,
    citationReadinessChanged: false,
  }, { status: 202, headers: { "cache-control": "no-store" } });
}
