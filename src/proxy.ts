import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SECURITY_HEADERS } from "@/lib/security";

export function proxy(req: NextRequest) {
  const res = NextResponse.next();

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }

  res.headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com;");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  if (req.nextUrl.pathname.startsWith("/.env")) {
    return new NextResponse("Not found", { status: 404 });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
