import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";
import { requireAdminToken } from "@/lib/admin-guard";
import { getApiMetrics, getFeedbackMetrics, getGroundingMetrics } from "@/lib/metrics";

const MAX_METRICS_WINDOW_MINUTES = 60 * 24 * 7;

export function parseMetricsWindow(value: string | null): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;

  return Math.min(Math.floor(parsed), MAX_METRICS_WINDOW_MINUTES);
}

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const windowMinutes = parseMetricsWindow(url.searchParams.get("window"));
  const api = getApiMetrics(windowMinutes);
  const grounding = getGroundingMetrics(windowMinutes);
  const feedback = getFeedbackMetrics(windowMinutes);
  return withSecurityHeaders(NextResponse.json({
    ...api,
    api,
    windowMinutes: windowMinutes ?? null,
    chatGrounding: grounding,
    chatFeedback: feedback,
    slo: {
      targets: {
        groundedRateMin: 85,
        unresolvedRateMax: 15,
        feedbackApprovalRateMin: 70,
      },
      status: {
        groundedRateOk: grounding.groundedRate >= 85,
        unresolvedRateOk: grounding.unresolvedRate <= 15,
        feedbackApprovalRateOk: feedback.approvalRate >= 70,
      },
    },
  }));
}
