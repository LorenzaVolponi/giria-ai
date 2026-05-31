import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/v1/admin/login/route";
import { GET, POST as SESSION_POST } from "../src/app/api/v1/admin/session/route";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
}

describe("admin login api", () => {
  afterEach(() => {
    restoreEnv();
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

  it("accepts custom configured admin credentials", async () => {
    process.env.ADMIN_LOGIN = "owner@example.com";
    process.env.ADMIN_PASSWORD = "strong-password";
    process.env.ADMIN_CODES = "111111,222222";
    process.env.ADMIN_API_TOKEN = "custom-session-token";

    const req = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login: "owner@example.com", password: "strong-password", code: "222222" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie") || "").toContain("custom-session-token");
  });

  it("fails closed in production when admin credentials are missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.ADMIN_LOGIN;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_CODES;

    const req = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login: "admin007", password: "admin007", code: "6390" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(String(data.error)).toContain("Credenciais admin não configuradas");
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
