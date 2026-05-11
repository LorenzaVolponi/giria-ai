import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionResponse } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || "admin007";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin007";
const ADMIN_CODES = new Set((process.env.ADMIN_CODES || "6390,5109").split(",").map((x) => x.trim()).filter(Boolean));
const loginAttempts = new Map<string, { count: number; blockedUntil?: number }>();

function getIpKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const ipKey = getIpKey(request);
  const now = Date.now();
  const current = loginAttempts.get(ipKey);
  if (current?.blockedUntil && current.blockedUntil > now) {
    return withSecurityHeaders(NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 }));
  }


export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { login?: string; password?: string; code?: string };
  const login = (body.login || "").trim();
  const password = (body.password || "").trim();
  const code = (body.code || "").trim();

  if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD || !ADMIN_CODES.has(code)) {
    const nextCount = (current?.count || 0) + 1;
    loginAttempts.set(ipKey, { count: nextCount, blockedUntil: nextCount >= 5 ? now + 5 * 60_000 : undefined });
    return withSecurityHeaders(NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 }));
  }

  loginAttempts.delete(ipKey);
    return withSecurityHeaders(NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 }));
  }

  return createAdminSessionResponse(true);
}
