import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/v1/admin/login/route";
import { GET, POST as SESSION_POST } from "../src/app/api/v1/admin/session/route";

describe("admin login api", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects invalid credentials", async () => {
    const req = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login: "x", password: "y", code: "0000" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("fails closed in production when admin credentials are missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_LOGIN", "");
    vi.stubEnv("ADMIN_PASSWORD", "");
    vi.stubEnv("ADMIN_CODES", "");

    const req = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.88" },
      body: JSON.stringify({ login: "admin007", password: "admin007", code: "6390" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("accepts valid credentials and sets session cookie", async () => {
    const req = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login: "admin007", password: "admin007", code: "6390" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie") || "").toContain("giria_admin_session");
  });

  it("accepts alternative validation code", async () => {
    const req = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login: "admin007", password: "admin007", code: "5109" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("validates admin session cookie", async () => {
    const loginReq = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login: "admin007", password: "admin007", code: "6390" }),
    });
    const loginRes = await POST(loginReq);
    const cookie = loginRes.headers.get("set-cookie") || "";

    const sessionReq = new NextRequest("http://localhost/api/v1/admin/session", {
      headers: { cookie },
    });
    const sessionRes = await GET(sessionReq);
    expect(sessionRes.status).toBe(200);
  });

  it("rate limits repeated invalid attempts", async () => {
    for (let i = 0; i < 5; i += 1) {
      const req = new NextRequest("http://localhost/api/v1/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.77" },
        body: JSON.stringify({ login: "x", password: "y", code: "0000" }),
      });
      await POST(req);
    }
    const blockedReq = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.77" },
      body: JSON.stringify({ login: "x", password: "y", code: "0000" }),
    });
    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);
  });

  it("rejects legacy session POST login path", async () => {
    const req = new NextRequest("http://localhost/api/v1/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "abc" }),
    });
    const res = await SESSION_POST(req);
    expect(res.status).toBe(405);
  });
});
