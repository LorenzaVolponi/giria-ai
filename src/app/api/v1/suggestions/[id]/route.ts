import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";
import { moderateSuggestionStatus } from "@/lib/suggestion-pipeline";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string; reason?: string };
  const status = body.status;

  if (status !== "approved" && status !== "rejected") {
    return withSecurityHeaders(NextResponse.json({ error: "Status inválido. Use approved ou rejected." }, { status: 400 }));
  }
  if (status === "rejected" && !body.reason?.trim()) {
    return withSecurityHeaders(NextResponse.json({ error: "Motivo é obrigatório para rejeição." }, { status: 400 }));
  }

  try {
    await moderateSuggestionStatus(id, status, { actor: "admin007", reason: body.reason });
    return withSecurityHeaders(NextResponse.json({ ok: true, id, status }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Não foi possível atualizar a sugestão." }, { status: 500 }));
  }
}
