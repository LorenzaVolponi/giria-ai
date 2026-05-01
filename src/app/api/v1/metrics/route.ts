import { NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";
import { getApiMetrics } from "@/lib/metrics";

export async function GET() {
  return withSecurityHeaders(NextResponse.json(getApiMetrics()));
}
