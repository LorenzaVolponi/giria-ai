import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

const { moderateSuggestionStatusMock } = vi.hoisted(() => ({
  moderateSuggestionStatusMock: vi.fn(),
}));

vi.mock("../src/lib/suggestion-pipeline", () => ({
  moderateSuggestionStatus: moderateSuggestionStatusMock,
}));

import { PATCH } from "../src/app/api/v1/suggestions/[id]/route";

describe("suggestion moderation API - error paths", () => {
  it("returns 401 when admin cookie is missing", async () => {
    const req = new NextRequest("http://localhost/api/v1/suggestions/abc", {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 when status is invalid", async () => {
    const req = new NextRequest("http://localhost/api/v1/suggestions/abc", {
      method: "PATCH",
      body: JSON.stringify({ status: "invalid" }),
      headers: { "content-type": "application/json", cookie: "giria_admin_session=admin-panel-session" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(String(data.error || "")).toContain("Status inválido");
    expect(moderateSuggestionStatusMock).not.toHaveBeenCalled();
  });
});
