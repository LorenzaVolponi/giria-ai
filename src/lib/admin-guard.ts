import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

const ADMIN_COOKIE = "giria_admin_session";

function getExpectedToken() {
  return process.env.ADMIN_API_TOKEN || "admin-panel-session";
}

export function requireAdminToken(request: NextRequest): NextResponse | null {
  const expected = getExpectedToken();
  if (!expected) return null;

  const providedHeader = request.headers.get("x-admin-token") || "";
  const providedCookie = request.cookies.get(ADMIN_COOKIE)?.value || "";

  if (providedHeader !== expected && providedCookie !== expected) {
    return withSecurityHeaders(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));
  }

  return null;
}

export function createAdminSessionResponse(ok = true) {
  const expected = getExpectedToken();

  const res = withSecurityHeaders(NextResponse.json({ ok }, { status: 200 }));
  res.cookies.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export function clearAdminSessionResponse() {
  const res = withSecurityHeaders(NextResponse.json({ ok: true }, { status: 200 }));
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
