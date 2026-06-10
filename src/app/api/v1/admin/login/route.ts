import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionResponse } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";
import { appendAdminAudit } from "@/lib/admin-audit";
import { authenticator } from "otplib";

const DEV_ADMIN_LOGIN = "admin007";
const DEV_ADMIN_PASSWORD = "admin007";
const DEV_ADMIN_CODES = "6390,5109";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getAdminCredentials() {
  const login = process.env.ADMIN_LOGIN?.trim() || (isProduction() ? "" : DEV_ADMIN_LOGIN);
  const password = process.env.ADMIN_PASSWORD?.trim() || (isProduction() ? "" : DEV_ADMIN_PASSWORD);
  const codesRaw = process.env.ADMIN_CODES?.trim() || (isProduction() ? "" : DEV_ADMIN_CODES);
  const codes = new Set(codesRaw.split(",").map((x) => x.trim()).filter(Boolean));
  const totpSecret = (process.env.ADMIN_TOTP_SECRET || "").trim();

  return { login, password, codes, totpSecret };
}
const loginAttempts = new Map<string, { count: number; blockedUntil?: number }>();

function getIpKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const ipKey = getIpKey(request);
  const now = Date.now();
  const current = loginAttempts.get(ipKey);
  if (current?.blockedUntil && current.blockedUntil > now) {
    await appendAdminAudit({ at: new Date().toISOString(), action: "login_blocked", ip: ipKey });
    return withSecurityHeaders(NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 }));
  }

  const credentials = getAdminCredentials();
  if (!credentials.login || !credentials.password || credentials.codes.size === 0) {
    await appendAdminAudit({ at: new Date().toISOString(), action: "login_misconfigured", ip: ipKey });
    return withSecurityHeaders(NextResponse.json({ error: "Credenciais admin não configuradas." }, { status: 503 }));
  }

  const body = (await request.json().catch(() => ({}))) as { login?: string; password?: string; code?: string; totp?: string };
  const login = (body.login || "").trim();
  const password = (body.password || "").trim();
  const code = (body.code || "").trim();
  const totp = (body.totp || "").trim();
  const validTotp = credentials.totpSecret ? authenticator.check(totp, credentials.totpSecret) : true;

  if (login !== credentials.login || password !== credentials.password || !credentials.codes.has(code) || !validTotp) {
    const nextCount = (current?.count || 0) + 1;
    loginAttempts.set(ipKey, { count: nextCount, blockedUntil: nextCount >= 5 ? now + 5 * 60_000 : undefined });
    await appendAdminAudit({ at: new Date().toISOString(), action: "login_failed", ip: ipKey, meta: { nextCount } });
    return withSecurityHeaders(NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 }));
  }

  loginAttempts.delete(ipKey);
  await appendAdminAudit({ at: new Date().toISOString(), action: "login_success", ip: ipKey });
  return createAdminSessionResponse(true);
}
