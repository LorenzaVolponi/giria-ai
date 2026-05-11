import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionResponse, requireAdminToken } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";

export async function POST(request: NextRequest) {
  void request;
  return withSecurityHeaders(NextResponse.json({ error: "Use /api/v1/admin/login para autenticar." }, { status: 405 }));
}

export async function DELETE() {
  return clearAdminSessionResponse();
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  return withSecurityHeaders(NextResponse.json({ ok: true }));
}
