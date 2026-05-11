import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../src/app/api/v1/admin/dashboard/route";

describe("admin dashboard api", () => {
  it("requires admin auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/admin/dashboard");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns dashboard payload for valid cookie", async () => {
    const req = new NextRequest("http://localhost/api/v1/admin/dashboard", {
      headers: { cookie: "giria_admin_session=admin-panel-session" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("topIps");
    expect(data).toHaveProperty("recent");
  });
});
