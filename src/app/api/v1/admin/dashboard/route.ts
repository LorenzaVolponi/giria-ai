import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole, requireAdminToken } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";
import { getSuggestionStatusCounts, listSuggestionsByStatus, listIngressIpMetrics } from "@/lib/suggestion-pipeline";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  const forbidden = requireAdminRole(request, ["viewer", "moderator", "owner"]);
  if (forbidden) return forbidden;

  const [summary, recent] = await Promise.all([
    getSuggestionStatusCounts(),
    listSuggestionsByStatus("all", 10),
  ]);
  const topIps = listIngressIpMetrics(12);
  const alerts: Array<{ level: "info" | "warning" | "critical"; code: string; message: string }> = [];
  const rejectionRate = summary.all > 0 ? summary.rejected / summary.all : 0;
  if (rejectionRate >= 0.6 && summary.all >= 10) {
    alerts.push({ level: "warning", code: "high_rejection_rate", message: "Taxa de rejeição acima de 60%. Revise regras de validação." });
  }
  if (topIps.some((ip) => ip.total >= 20)) {
    alerts.push({ level: "critical", code: "ip_spike", message: "Pico de envios detectado por um ou mais IPs." });
  }
  if (alerts.length === 0) {
    alerts.push({ level: "info", code: "healthy", message: "Sistema operando dentro do esperado." });
  }

  return withSecurityHeaders(
    NextResponse.json({
      summary,
      topIps,
      alerts,
      recent: recent.map((x) => ({
        id: x.id,
        term: x.term,
        status: x.status,
        score: x.score,
        submitterName: x.submitterName,
        createdAt: x.createdAt,
      })),
    }),
  );
}
