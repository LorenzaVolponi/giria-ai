import { NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

export async function GET() {
  return withSecurityHeaders(
    NextResponse.json({
      status: "ok",
      service: "giria-ai",
      version: "legacy-health-alias",
      timestamp: new Date().toISOString(),
      canonical: "/api/v1/health",
    }),
  );
}
