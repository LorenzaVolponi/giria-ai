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

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)"],
};
