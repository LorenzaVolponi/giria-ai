import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";
import { requireAdminToken } from "@/lib/admin-guard";
import { getApiMetrics, getFeedbackMetrics, getGroundingMetrics } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const api = getApiMetrics();
  return withSecurityHeaders(NextResponse.json({
    ...api,
    api,
    chatGrounding: getGroundingMetrics(),
    chatFeedback: getFeedbackMetrics(),
  }));
}
