import { NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";
import { requireAdminToken } from "@/lib/admin-guard";
import { getApiMetrics } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;
  return withSecurityHeaders(NextResponse.json(getApiMetrics()));
}
