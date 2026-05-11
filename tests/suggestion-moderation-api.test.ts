import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "../src/app/api/v1/suggestions/[id]/route";

describe("suggestion moderation API", () => {
  it("requires reason for rejected status", async () => {
    const req = new NextRequest("http://localhost/api/v1/suggestions/abc", {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected" }),
      headers: {
        "content-type": "application/json",
        cookie: "giria_admin_session=admin-panel-session; giria_admin_csrf=test-csrf",
        "x-csrf-token": "test-csrf",
      },
      headers: { "content-type": "application/json", cookie: "giria_admin_session=admin-panel-session" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Motivo");
  });
});
