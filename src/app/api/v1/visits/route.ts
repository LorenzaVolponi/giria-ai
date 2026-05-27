import { NextRequest, NextResponse } from "next/server";
import { buildVisitorEvent, getVisitorStats, registerVisit } from "@/lib/visitors";
import { withSecurityHeaders } from "@/lib/security";
import { requireAdminToken } from "@/lib/admin-guard";
import { z } from "zod";
import { applyRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

const visitSchema = z.object({ path: z.string().trim().min(1).max(120).optional() });

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = await checkRateLimit(`visits:${ip}`, 25, 60);
    if (rate.limited) {
      const limited = withSecurityHeaders(NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 }));
      applyRateLimitHeaders(limited.headers, { maxRequests: 25, windowSec: 60, rate });
      return limited;
    }
    const bodyRaw = await request.json().catch(() => ({}));
    const parsed = visitSchema.safeParse(bodyRaw);
    const event = buildVisitorEvent(request, parsed.success ? parsed.data.path || "/" : "/");
    await registerVisit(event);
    const response = withSecurityHeaders(NextResponse.json({ ok: true, id: event.id }));
    applyRateLimitHeaders(response.headers, { maxRequests: 25, windowSec: 60, rate });
    return response;
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Falha ao registrar visita." }, { status: 500 }));
  }
}

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;
  return withSecurityHeaders(NextResponse.json(await getVisitorStats()));
}
