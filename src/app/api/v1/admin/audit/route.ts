import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole, requireAdminToken } from "@/lib/admin-guard";
import { getClientIp, withSecurityHeaders } from "@/lib/security";
import { isRateLimited } from "@/lib/rate-limit";
import { listAdminAudit } from "@/lib/admin-audit";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  const forbidden = requireAdminRole(request, ["owner", "moderator"]);
  if (forbidden) return forbidden;

  const ip = getClientIp(request);
  const rate = await isRateLimited(`admin:audit:${ip}`, 30, 60);
  if (rate.limited) return withSecurityHeaders(NextResponse.json({ error: "Muitas requisições." }, { status: 429 }));

  const limit = Math.min(200, Math.max(1, Number(request.nextUrl.searchParams.get("limit") || 50)));
  const items = await listAdminAudit(limit);
  return withSecurityHeaders(NextResponse.json({ ok: true, items }));
}
