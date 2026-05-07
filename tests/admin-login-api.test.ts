import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/v1/admin/login/route";

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
      body: JSON.stringify({ login: "admin007", password: "admin007código", code: "6390" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie") || "").toContain("giria_admin_session");
  });
});

