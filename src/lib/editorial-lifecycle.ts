import { getDurableGeoSignals, persistGeoSignal } from "@/lib/geo-signal-store";

export type EditorialWorkflowStatus = "discovered" | "researching" | "reviewed" | "dismissed";

export async function setEditorialWorkflowState(input: {
  key: string;
  status: EditorialWorkflowStatus;
  note?: string | null;
  actor?: string | null;
}) {
  const key = input.key.trim().slice(0, 180);
  if (!key) throw new Error("Editorial workflow key is required");

  return persistGeoSignal({
    type: "editorial_state",
    key,
    payload: {
      status: input.status,
      note: String(input.note || "").trim().slice(0, 500) || null,
      actor: String(input.actor || "admin").trim().slice(0, 120) || "admin",
    },
  });
}

export async function getEditorialWorkflowSnapshot(limit = 500) {
  const stored = await getDurableGeoSignals(limit);
  const latest = new Map<string, {
    key: string;
    status: EditorialWorkflowStatus;
    note: string | null;
    actor: string;
    updatedAt: string | null;
  }>();

  for (const event of stored.events) {
    if (event.type !== "editorial_state") continue;
    if (latest.has(event.key)) continue;
    const status = event.payload.status;
    if (!(["discovered", "researching", "reviewed", "dismissed"] as const).includes(status as EditorialWorkflowStatus)) continue;
    latest.set(event.key, {
      key: event.key,
      status: status as EditorialWorkflowStatus,
      note: typeof event.payload.note === "string" ? event.payload.note : null,
      actor: typeof event.payload.actor === "string" ? event.payload.actor : "admin",
      updatedAt: event.timestamp || null,
    });
  }

  return {
    backend: stored.backend,
    durable: stored.durable,
    states: [...latest.values()],
    policy: {
      workflowOnly: true,
      citationReadinessUnaffected: true,
      note: "Workflow state tracks human research progress only. Citation readiness remains derived from editorial evidence, quality and freshness.",
    },
  };
}
