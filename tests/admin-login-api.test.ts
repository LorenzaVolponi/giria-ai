import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/v1/admin/login/route";
import { GET } from "../src/app/api/v1/admin/session/route";

describe("admin login api", () => {
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
});
