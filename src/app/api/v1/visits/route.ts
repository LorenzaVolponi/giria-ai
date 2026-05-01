import { NextRequest, NextResponse } from "next/server";
import { buildVisitorEvent, getVisitorStats, registerVisit } from "@/lib/visitors";
import { withSecurityHeaders } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { path?: string };
    const event = buildVisitorEvent(request, body.path || "/");
    registerVisit(event);
    return withSecurityHeaders(NextResponse.json({ ok: true, id: event.id }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Falha ao registrar visita." }, { status: 500 }));
  }
}

export async function GET() {
  return withSecurityHeaders(NextResponse.json(getVisitorStats()));
}
