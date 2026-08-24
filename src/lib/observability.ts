import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { recordApiMetric } from "@/lib/metrics";
import { recordRuntimeSample } from "@/lib/runtime-telemetry";

export function getRequestId(req: NextRequest): string {
  return req.headers.get("x-request-id") || randomUUID();
}

export function logApiEvent(event: {
  requestId: string;
  route: string;
  status: number;
  durationMs: number;
  message?: string;
  fallbackUsed?: boolean;
  cacheHit?: boolean;
}) {
  const payload = { timestamp: new Date().toISOString(), ...event };
  recordApiMetric(event.status);
  recordRuntimeSample({ durationMs: event.durationMs, fallbackUsed: Boolean(event.fallbackUsed), cacheHit: event.cacheHit });
  console.log(JSON.stringify(payload));
}
