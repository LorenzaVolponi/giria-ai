import { NextRequest, NextResponse } from "next/server";
import { buildVisitorEvent, getVisitorStats, registerVisit } from "@/lib/visitors";
import { withSecurityHeaders } from "@/lib/security";
import { z } from "zod";

const visitSchema = z.object({ path: z.string().trim().min(1).max(120).optional() });

export async function POST(request: NextRequest) {
  try {
    const bodyRaw = await request.json().catch(() => ({}));
    const parsed = visitSchema.safeParse(bodyRaw);
    const event = buildVisitorEvent(request, parsed.success ? parsed.data.path || "/" : "/");
    await registerVisit(event);
    return withSecurityHeaders(NextResponse.json({ ok: true, id: event.id }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Falha ao registrar visita." }, { status: 500 }));
  }
}

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;
  return withSecurityHeaders(NextResponse.json(await getVisitorStats()));
}
