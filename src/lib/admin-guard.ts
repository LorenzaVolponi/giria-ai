import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

const ADMIN_COOKIE = "giria_admin_session";
const ADMIN_CSRF_COOKIE = "giria_admin_csrf";
const ADMIN_ROLE_COOKIE = "giria_admin_role";
const ADMIN_ACTOR_COOKIE = "giria_admin_actor";

const DEV_ADMIN_TOKEN = "admin-panel-session";
const DEV_ADMIN_ACTOR = "admin007";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  actor: string;
  exp: number;
  nonce: string;
};

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function getExpectedToken() {
  const configuredToken = process.env.ADMIN_API_TOKEN?.trim();
  if (configuredToken) return configuredToken;
  return isProduction() ? "" : DEV_ADMIN_TOKEN;
}

function getSessionSecret() {
  const configuredSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (configuredSecret) return configuredSecret;
  return isProduction() ? "" : getExpectedToken();
}

function createSessionToken(actor: string) {
  const secret = getSessionSecret();
  if (!secret) return "";

  const payload: AdminSessionPayload = {
    actor,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

function readSessionToken(token: string): AdminSessionPayload | null {
  if (!isProduction() && token === DEV_ADMIN_TOKEN) {
    return {
      actor: DEV_ADMIN_ACTOR,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
      nonce: "dev-legacy-session",
    };
  }

  const secret = getSessionSecret();
  if (!secret) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  if (!safeEqual(signature, sign(encodedPayload, secret))) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionPayload;
    if (!payload.actor || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function adminTokenNotConfiguredResponse() {
  return withSecurityHeaders(NextResponse.json({ error: "ADMIN_API_TOKEN não configurado." }, { status: 503 }));
}

export function requireAdminToken(request: NextRequest): NextResponse | null {
  const expected = getExpectedToken();
  if (!expected) return adminTokenNotConfiguredResponse();

  const providedHeader = request.headers.get("x-admin-token") || "";
  const providedCookie = request.cookies.get(ADMIN_COOKIE)?.value || "";

  if (providedHeader === expected || readSessionToken(providedCookie)) return null;

  return withSecurityHeaders(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));
}

export function getAdminActor(request: NextRequest) {
  const actorCookie = request.cookies.get(ADMIN_ACTOR_COOKIE)?.value;
  const session = readSessionToken(request.cookies.get(ADMIN_COOKIE)?.value || "");
  return actorCookie || session?.actor || process.env.ADMIN_LOGIN?.trim() || (isProduction() ? "api-admin" : DEV_ADMIN_ACTOR);
}

export function createAdminSessionResponse(ok = true, actor = DEV_ADMIN_ACTOR) {
  const expected = getExpectedToken();
  if (!expected) return adminTokenNotConfiguredResponse();

  const csrf = crypto.randomUUID();
  const role = process.env.ADMIN_ROLE || "owner";
  const safeActor = actor.trim() || DEV_ADMIN_ACTOR;
  const sessionToken = createSessionToken(safeActor);
  if (!sessionToken) {
    return withSecurityHeaders(NextResponse.json({ error: "ADMIN_SESSION_SECRET não configurado." }, { status: 503 }));
  }

  const res = withSecurityHeaders(NextResponse.json({ ok }, { status: 200 }));
  res.cookies.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  res.cookies.set(ADMIN_CSRF_COOKIE, csrf, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  res.cookies.set(ADMIN_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  res.cookies.set(ADMIN_ACTOR_COOKIE, safeActor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}

export function clearAdminSessionResponse() {
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
