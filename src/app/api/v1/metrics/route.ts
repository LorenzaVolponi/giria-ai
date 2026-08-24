import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";
import { requireAdminToken } from "@/lib/admin-guard";
import { getApiMetrics, getFeedbackMetrics, getGroundingMetrics, parseMetricsWindow } from "@/lib/metrics";
import { getRuntimeTelemetry } from "@/lib/runtime-telemetry";

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const windowMinutes = parseMetricsWindow(url.searchParams.get("window"));
  const effectiveWindow = windowMinutes ?? 60;
  const api = getApiMetrics(windowMinutes);
  const grounding = getGroundingMetrics(windowMinutes);
  const feedback = getFeedbackMetrics(windowMinutes);
  const runtime = getRuntimeTelemetry(effectiveWindow);

  return withSecurityHeaders(NextResponse.json({
    ...api,
    api,
    runtime,
    windowMinutes: windowMinutes ?? null,
    chatGrounding: grounding,
    chatFeedback: feedback,
    slo: {
      targets: {
        groundedRateMin: 85,
        unresolvedRateMax: 15,
        feedbackApprovalRateMin: 70,
        p95LatencyMsMax: 2500,
        fallbackRateMax: 20,
      },
      status: {
        groundedRateOk: grounding.groundedRate >= 85,
        unresolvedRateOk: grounding.unresolvedRate <= 15,
        feedbackApprovalRateOk: feedback.approvalRate >= 70,
        p95LatencyOk: runtime.latencyMs.p95 <= 2500,
        fallbackRateOk: runtime.fallbackRate <= 20,
      },
    },
  }));
}
