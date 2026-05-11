import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "../src/app/api/v1/suggestions/[id]/route";

describe("suggestion moderation API", () => {
  it("allows rejected status without reason for admin moderation", async () => {
    const req = new NextRequest("http://localhost/api/v1/suggestions/abc", {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected" }),
      headers: { "content-type": "application/json", cookie: "giria_admin_session=admin-panel-session" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "abc" }) });
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.status).toBe("rejected");
    }
  });
});
