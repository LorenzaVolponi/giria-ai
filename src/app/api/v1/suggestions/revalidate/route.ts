import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";
import { enqueueRevalidateJob, getRevalidateJob } from "@/lib/revalidate-queue";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const jobId = enqueueRevalidateJob();
  return withSecurityHeaders(NextResponse.json({ ok: true, queued: true, jobId }, { status: 202 }));
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const jobId = request.nextUrl.searchParams.get("jobId") || "";
  const job = getRevalidateJob(jobId);
  if (!job) return withSecurityHeaders(NextResponse.json({ error: "Job não encontrado." }, { status: 404 }));
  return withSecurityHeaders(NextResponse.json({ ok: true, job }));
}
