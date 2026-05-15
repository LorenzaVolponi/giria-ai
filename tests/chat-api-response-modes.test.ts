import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as chatPost } from "../src/app/api/chat/route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("chat API response modes", () => {
  it("returns only response for responseMode=single", async () => {
    const req = makeRequest({ message: "oi", responseMode: "single" });
    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("response");
    expect(json).not.toHaveProperty("responses");
  });

  it("returns list for responseMode=list", async () => {
    const req = makeRequest({
      message: "o que significa slay?",
      responseMode: "list",
      history: [{ role: "assistant", content: "resposta anterior" }],
    });
    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json.responses)).toBe(true);
    expect(json.responses.length).toBeGreaterThan(0);
  });

  it("returns 400 for invalid responseMode", async () => {
    const req = makeRequest({ message: "oi", responseMode: "invalid" });
    const res = await chatPost(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when mixing responseMode with legacy flags", async () => {
    const req = makeRequest({ message: "oi", responseMode: "single", onlyChatResponse: true });
    const res = await chatPost(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when both legacy flags are true", async () => {
    const req = makeRequest({ message: "oi", onlyChatResponse: true, listChatResponses: true });
    const res = await chatPost(req);
    expect(res.status).toBe(400);
  });

  it("returns default payload when responseMode=default", async () => {
    const req = makeRequest({ message: "o que significa slay?", responseMode: "default" });
    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("response");
    expect(json).not.toHaveProperty("responses");
  });

  it("asks for clarification on contextual follow-up when previous assistant message has multiple slang terms", async () => {
    const req = makeRequest({
      message: "e isso?",
      history: [
        {
          role: "assistant",
          content: 'Na resposta anterior falamos sobre "slay" e também "cringe".',
        },
      ],
    });
    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.response).toContain("Detectei mais de uma gíria");
  });
});
