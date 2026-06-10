import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

const ADMIN_COOKIE = "giria_admin_session";
const ADMIN_CSRF_COOKIE = "giria_admin_csrf";
const ADMIN_ROLE_COOKIE = "giria_admin_role";

const DEV_ADMIN_TOKEN = "admin-panel-session";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getExpectedToken() {
  const configuredToken = process.env.ADMIN_API_TOKEN?.trim();
  if (configuredToken) return configuredToken;
  return isProduction() ? "" : DEV_ADMIN_TOKEN;
}

function adminTokenNotConfiguredResponse() {
  return withSecurityHeaders(NextResponse.json({ error: "ADMIN_API_TOKEN não configurado." }, { status: 503 }));
}

export function requireAdminToken(request: NextRequest): NextResponse | null {
  const expected = getExpectedToken();
  if (!expected) return adminTokenNotConfiguredResponse();

  const providedHeader = request.headers.get("x-admin-token") || "";
  const providedCookie = request.cookies.get(ADMIN_COOKIE)?.value || "";

  if (providedHeader !== expected && providedCookie !== expected) {
    return withSecurityHeaders(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));
  }

  return null;
}

export function createAdminSessionResponse(ok = true) {
  const expected = getExpectedToken();
  if (!expected) return adminTokenNotConfiguredResponse();

  const csrf = crypto.randomUUID();
  const role = process.env.ADMIN_ROLE || "owner";

  const res = withSecurityHeaders(NextResponse.json({ ok }, { status: 200 }));
  res.cookies.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  res.cookies.set(ADMIN_CSRF_COOKIE, csrf, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  res.cookies.set(ADMIN_ROLE_COOKIE, role, {
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
  res.cookies.set(ADMIN_CSRF_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(ADMIN_ROLE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export function requireAdminCsrf(request: NextRequest): NextResponse | null {
  const cookieToken = request.cookies.get(ADMIN_CSRF_COOKIE)?.value || "";
  const headerToken = request.headers.get("x-csrf-token") || "";
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return withSecurityHeaders(NextResponse.json({ error: "CSRF inválido." }, { status: 403 }));
  }
  return null;
}

export function requireAdminRole(request: NextRequest, allowed: Array<"viewer" | "moderator" | "owner">): NextResponse | null {
  const role = (request.cookies.get(ADMIN_ROLE_COOKIE)?.value || "viewer") as "viewer" | "moderator" | "owner";
  if (!allowed.includes(role)) {
    return withSecurityHeaders(NextResponse.json({ error: "Permissão insuficiente." }, { status: 403 }));
  }
  return null;
}
