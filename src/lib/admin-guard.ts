import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

export function requireAdminToken(request: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return null;

  const provided = request.headers.get("x-admin-token") || "";
  if (provided !== expected) {
    return withSecurityHeaders(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));
  }

  return null;
}
