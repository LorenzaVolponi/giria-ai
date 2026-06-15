import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";
import { requireAdminToken } from "@/lib/admin-guard";
import { getApiMetrics, getFeedbackMetrics, getGroundingMetrics, parseMetricsWindow } from "@/lib/metrics";

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
