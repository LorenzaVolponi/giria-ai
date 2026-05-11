import { NextRequest, NextResponse } from "next/server";
import { requireAdminCsrf, requireAdminToken } from "@/lib/admin-guard";
import { getClientIp, withSecurityHeaders } from "@/lib/security";
import { moderateSuggestionStatus } from "@/lib/suggestion-pipeline";
import { appendAdminAudit } from "@/lib/admin-audit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  const csrfBlocked = requireAdminCsrf(request);
  if (csrfBlocked) return csrfBlocked;

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string; reason?: string };
  const status = body.status;

  if (status !== "approved" && status !== "rejected") {
    return withSecurityHeaders(NextResponse.json({ error: "Status inválido. Use approved ou rejected." }, { status: 400 }));
  }
  try {
    await moderateSuggestionStatus(id, status, { actor: "admin007", reason: body.reason });
    await appendAdminAudit({ at: new Date().toISOString(), action: `moderate_${status}`, ip: getClientIp(request), meta: { id } });
    return withSecurityHeaders(NextResponse.json({ ok: true, id, status }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Não foi possível atualizar a sugestão." }, { status: 500 }));
  }
}
