import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

const ADMIN_COOKIE = "giria_admin_session";
const ADMIN_CSRF_COOKIE = "giria_admin_csrf";
const ADMIN_ROLE_COOKIE = "giria_admin_role";
const ADMIN_ACTOR_COOKIE = "giria_admin_actor";

const DEV_ADMIN_TOKEN = "admin-panel-session";
const DEV_ADMIN_ACTOR = "admin007";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;
const adminSessions = new Map<string, { actor: string; role: string; expiresAt: number }>();

function createOpaqueSessionToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function pruneExpiredAdminSessions() {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (session.expiresAt <= now) adminSessions.delete(token);
  }
}

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
  const session = providedCookie ? adminSessions.get(providedCookie) : null;
  if (session && session.expiresAt <= Date.now()) {
    adminSessions.delete(providedCookie);
  }

  if (providedHeader !== expected && (!session || session.expiresAt <= Date.now())) {
    return withSecurityHeaders(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));
  }

  return null;
}

export function getAdminActor(request: NextRequest) {
  return request.cookies.get(ADMIN_ACTOR_COOKIE)?.value || process.env.ADMIN_LOGIN?.trim() || (isProduction() ? "api-admin" : DEV_ADMIN_ACTOR);
}

export function createAdminSessionResponse(ok = true, actor = DEV_ADMIN_ACTOR) {
  const expected = getExpectedToken();
  if (!expected) return adminTokenNotConfiguredResponse();

  pruneExpiredAdminSessions();
  const csrf = crypto.randomUUID();
  const role = process.env.ADMIN_ROLE || "owner";
  const safeActor = actor.trim() || DEV_ADMIN_ACTOR;
  const sessionToken = createOpaqueSessionToken();
  adminSessions.set(sessionToken, {
    actor: safeActor,
    role,
    expiresAt: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
  });

  const res = withSecurityHeaders(NextResponse.json({ ok }, { status: 200 }));
  res.cookies.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  res.cookies.set(ADMIN_CSRF_COOKIE, csrf, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  res.cookies.set(ADMIN_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  res.cookies.set(ADMIN_ACTOR_COOKIE, safeActor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  return res;
}

export function clearAdminSessionResponse(request?: NextRequest) {
  const token = request?.cookies.get(ADMIN_COOKIE)?.value || "";
  if (token) adminSessions.delete(token);
  const res = withSecurityHeaders(NextResponse.json({ ok: true }, { status: 200 }));
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(ADMIN_CSRF_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(ADMIN_ROLE_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(ADMIN_ACTOR_COOKIE, "", { path: "/", maxAge: 0 });
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

export function resetAdminSessionsForTests() {
  adminSessions.clear();
}
