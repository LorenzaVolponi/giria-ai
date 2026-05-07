import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as translatePost } from "../src/app/api/v1/translate/route";
import { POST as visitsPost, GET as visitsGet } from "../src/app/api/v1/visits/route";

function makeRequest(url: string, method: string, body?: unknown, headers?: Record<string, string>) {
  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("API v1 integration", () => {
  beforeEach(() => {
    delete process.env.ADMIN_API_TOKEN;
  });

  it("translate returns 400 for empty payload", async () => {
    const req = makeRequest("http://localhost/api/v1/translate", "POST", {});
    const res = await translatePost(req);
    expect(res.status).toBe(400);
  });

  it("translate returns structured fields for valid term", async () => {
    const req = makeRequest("http://localhost/api/v1/translate", "POST", { text: "slay" });
    const res = await translatePost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("traducaoFormal");
    expect(json).toHaveProperty("explicacaoContextual");
    expect(json).toHaveProperty("intencaoSocialEmocional");
  });

  it("visits accepts POST and returns stats", async () => {
    const postReq = makeRequest("http://localhost/api/v1/visits", "POST", { path: "/diagnostico" });
    const postRes = await visitsPost(postReq);
    expect(postRes.status).toBe(200);

    const getReq = makeRequest("http://localhost/api/v1/visits", "GET");
    const getRes = await visitsGet(getReq);
    const data = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(data).toHaveProperty("totalVisits");
  });

  it("visits GET blocks when admin token is configured and missing", async () => {
    process.env.ADMIN_API_TOKEN = "secret-token";
    const getReq = makeRequest("http://localhost/api/v1/visits", "GET");
    const getRes = await visitsGet(getReq);
    expect(getRes.status).toBe(401);
  });
});
