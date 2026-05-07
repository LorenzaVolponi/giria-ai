import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SECURITY_HEADERS } from "@/lib/security";

const SKEW_GUARD_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function isDocumentRequest(req: NextRequest): boolean {
  const accept = req.headers.get("accept") ?? "";
  return req.method === "GET" && accept.includes("text/html");
}

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/.env")) {
    return new NextResponse("Not found", { status: 404 });
  }

export function proxy(req: NextRequest) {
  const res = NextResponse.next();

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }

  if (isDocumentRequest(req)) {
    for (const [k, v] of Object.entries(SKEW_GUARD_HEADERS)) {
      res.headers.set(k, v);
    }
  }

  const version = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_URL ?? "local";
  res.headers.set("X-App-Version", version);
  res.headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com;");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  if (req.nextUrl.pathname.startsWith("/.env")) {
    return new NextResponse("Not found", { status: 404 });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)"],
};
