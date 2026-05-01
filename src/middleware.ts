import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SECURITY_HEADERS } from "@/lib/security";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }

  if (req.nextUrl.pathname.startsWith("/.env")) {
    return new NextResponse("Not found", { status: 404 });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
