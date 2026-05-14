import { NextRequest, NextResponse } from "next/server";
import { requireAdminCsrf, requireAdminRole, requireAdminToken } from "@/lib/admin-guard";
import { getClientIp, withSecurityHeaders } from "@/lib/security";
import { enqueueRevalidateJob, getRevalidateJob } from "@/lib/revalidate-queue";
import { isRateLimited } from "@/lib/rate-limit";
import { appendAdminAudit } from "@/lib/admin-audit";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  const forbidden = requireAdminRole(request, ["moderator", "owner"]);
  if (forbidden) return forbidden;
  const csrfBlocked = requireAdminCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const ip = getClientIp(request);
  const rate = await isRateLimited(`admin:revalidate:${ip}`, 6, 60);
  if (rate.limited) return withSecurityHeaders(NextResponse.json({ error: "Muitas requisições de revalidação." }, { status: 429 }));

  const jobId = enqueueRevalidateJob();
  await appendAdminAudit({ at: new Date().toISOString(), action: "revalidate_enqueue", ip, meta: { jobId } });
  return withSecurityHeaders(NextResponse.json({ ok: true, queued: true, jobId }, { status: 202 }));
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  const forbidden = requireAdminRole(request, ["moderator", "owner"]);
  if (forbidden) return forbidden;

  const jobId = request.nextUrl.searchParams.get("jobId") || "";
  const job = await getRevalidateJob(jobId);
  if (!job) return withSecurityHeaders(NextResponse.json({ error: "Job não encontrado." }, { status: 404 }));
  return withSecurityHeaders(NextResponse.json({ ok: true, job }));
}
