import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";
import { requireAdminToken } from "@/lib/admin-guard";
import { getApiMetrics, getFeedbackMetrics, getGroundingMetrics } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const windowMinutes = Number(url.searchParams.get("window") || "0") || undefined;
  const api = getApiMetrics(windowMinutes);
  return withSecurityHeaders(NextResponse.json({
    ...api,
    api,
    chatGrounding: getGroundingMetrics(windowMinutes),
    chatFeedback: getFeedbackMetrics(windowMinutes),
  }));
}
