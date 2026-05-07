import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionResponse } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || "admin007";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin007código";
const ADMIN_CODES = new Set((process.env.ADMIN_CODES || "6390,5109").split(",").map((x) => x.trim()).filter(Boolean));

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { login?: string; password?: string; code?: string };
  const login = (body.login || "").trim();
  const password = (body.password || "").trim();
  const code = (body.code || "").trim();

  if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD || !ADMIN_CODES.has(code)) {
    return withSecurityHeaders(NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 }));
  }

  return createAdminSessionResponse(true);
}
