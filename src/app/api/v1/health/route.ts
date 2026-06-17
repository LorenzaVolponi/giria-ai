import { NextResponse } from "next/server";
import { buildHealthPayload } from "@/lib/health";
import { withSecurityHeaders } from "@/lib/security";

export async function GET() {
  return withSecurityHeaders(NextResponse.json(buildHealthPayload()));
}
