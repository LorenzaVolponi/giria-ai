import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { recordApiMetric } from "@/lib/metrics";

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
}) {
  const payload = {
    timestamp: new Date().toISOString(),
    ...event,
  };

  recordApiMetric(event.status);
  console.log(JSON.stringify(payload));
}
