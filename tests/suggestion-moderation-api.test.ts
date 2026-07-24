import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

const { moderateSuggestionStatusMock } = vi.hoisted(() => ({
  moderateSuggestionStatusMock: vi.fn(),
}));

vi.mock("../src/lib/suggestion-pipeline", () => ({
  moderateSuggestionStatus: moderateSuggestionStatusMock,
}));

import { PATCH } from "../src/app/api/v1/suggestions/[id]/route";
import { createAdminSessionResponse } from "../src/lib/admin-guard";

function cookieHeaderForAdminSession(actor = "admin007") {
  const res = createAdminSessionResponse(true, actor);
  const setCookie = res.headers.get("set-cookie") || "";
  const cookies = ["giria_admin_session", "giria_admin_csrf", "giria_admin_role", "giria_admin_actor"]
    .map((name) => `${name}=${new RegExp(`${name}=([^;]+)`).exec(setCookie)?.[1] || ""}`)
    .join("; ");
  const csrf = /giria_admin_csrf=([^;]+)/.exec(cookies)?.[1] || "";
  return { cookie: cookies, csrf };
}

describe("suggestion moderation API", () => {
  it("allows rejected status without reason for admin moderation", async () => {
    moderateSuggestionStatusMock.mockResolvedValueOnce(undefined);

    const session = cookieHeaderForAdminSession();
    const req = new NextRequest("http://localhost/api/v1/suggestions/abc", {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected" }),
      headers: {
        "content-type": "application/json",
        cookie: session.cookie,
        "x-csrf-token": session.csrf,
      },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.status).toBe("rejected");
    expect(moderateSuggestionStatusMock).toHaveBeenCalledWith("abc", "rejected", { actor: "admin007", reason: undefined });
  });

  it("uses the actor bound to the authenticated session in moderation history", async () => {
    moderateSuggestionStatusMock.mockResolvedValueOnce(undefined);

    const session = cookieHeaderForAdminSession("lorenza");
    const req = new NextRequest("http://localhost/api/v1/suggestions/def", {
      method: "PATCH",
      body: JSON.stringify({ status: "approved", reason: "ok" }),
      headers: {
        "content-type": "application/json",
        cookie: session.cookie,
        "x-csrf-token": session.csrf,
      },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "def" }) });
    expect(res.status).toBe(200);
    expect(moderateSuggestionStatusMock).toHaveBeenCalledWith("def", "approved", { actor: "lorenza", reason: "ok" });
  });

});
