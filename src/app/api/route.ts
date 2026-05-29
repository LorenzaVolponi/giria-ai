import { NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

export async function GET() {
  return withSecurityHeaders(NextResponse.json({
    service: "giria-ai",
    version: "v1",
    status: "ok",
    endpoints: {
      health: "/api/v1/health",
      translate: "/api/v1/translate",
      chat: "/api/chat",
      suggestions: "/api/v1/suggestions",
      metrics: "/api/v1/metrics",
    },
  }));
}
