import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../src/app/api/v1/admin/dashboard/route";
import { POST as LOGIN_POST } from "../src/app/api/v1/admin/login/route";

describe("admin dashboard api", () => {
  it("requires admin auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/admin/dashboard");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns dashboard payload for valid opaque session cookie", async () => {
    const loginReq = new NextRequest("http://localhost/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login: "admin007", password: "admin007", code: "6390" }),
    });
    const loginRes = await LOGIN_POST(loginReq);
    const cookie = loginRes.headers.get("set-cookie") || "";

    const req = new NextRequest("http://localhost/api/v1/admin/dashboard", {
      headers: { cookie },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("topIps");
    expect(data).toHaveProperty("recent");
    expect(data).toHaveProperty("alerts");
  });
});
