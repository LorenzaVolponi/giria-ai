import { NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

export async function GET() {
  return withSecurityHeaders(
    NextResponse.json({ status: "ok", service: "giria-ai", timestamp: new Date().toISOString() }),
  );
}
