import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionResponse, createAdminSessionResponse } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_API_TOKEN || "";
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  if (!expected || body.token !== expected) {
    return withSecurityHeaders(NextResponse.json({ error: "Token inválido" }, { status: 401 }));
  }

  return createAdminSessionResponse(true);
}

export async function DELETE() {
  return clearAdminSessionResponse();
}
