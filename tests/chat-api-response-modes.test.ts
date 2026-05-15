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

function makeInvalidJsonRequest(rawBody: string) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: rawBody,
  });
}

describe("chat API response modes", () => {
  it("returns only response for responseMode=single", async () => {
    const req = makeRequest({ message: "oi", responseMode: "single" });
    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.mode).toBe("single");
    expect(res.headers.get("x-response-mode")).toBe("single");
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
    expect(json.mode).toBe("list");
    expect(res.headers.get("x-response-mode")).toBe("list");
    expect(Array.isArray(json.responses)).toBe(true);
    expect(json.responses.length).toBeGreaterThan(0);
  });

  it("returns 400 for invalid responseMode", async () => {
    const req = makeRequest({ message: "oi", responseMode: "invalid" });
    const res = await chatPost(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = makeInvalidJsonRequest("{ invalid json");
    const res = await chatPost(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain("JSON inválido");
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
    expect(json.mode).toBe("default");
    expect(res.headers.get("x-response-mode")).toBe("default");
    expect(json).toHaveProperty("response");
    expect(json).not.toHaveProperty("responses");
  });

  it("keeps backward compatibility for onlyChatResponse legacy flag", async () => {
    const req = makeRequest({ message: "oi", onlyChatResponse: true });
    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.mode).toBe("single");
    expect(res.headers.get("x-response-mode")).toBe("single");
    expect(json).toHaveProperty("response");
    expect(json).not.toHaveProperty("responses");
    expect(json).not.toHaveProperty("meaning");
    expect(res.headers.get("x-api-warn")).toContain("deprecated");
    expect(res.headers.get("deprecation")).toBe("true");
    expect(res.headers.get("sunset")).toBe("Mon, 31 Aug 2026 23:59:59 GMT");
    expect(res.headers.get("link")).toContain('rel="deprecation"');
  });

  it("keeps backward compatibility for listChatResponses legacy flag", async () => {
    const req = makeRequest({
      message: "oi",
      listChatResponses: true,
      history: [{ role: "assistant", content: "anterior" }],
    });
    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.mode).toBe("list");
    expect(res.headers.get("x-response-mode")).toBe("list");
    expect(Array.isArray(json.responses)).toBe(true);
    expect(json.responses[0]).toBe("anterior");
    expect(res.headers.get("x-api-warn")).toContain("deprecated");
    expect(res.headers.get("deprecation")).toBe("true");
    expect(res.headers.get("sunset")).toBe("Mon, 31 Aug 2026 23:59:59 GMT");
    expect(res.headers.get("link")).toContain('rel="deprecation"');
  });

  it("does not send deprecation headers when using responseMode", async () => {
    const req = makeRequest({ message: "oi", responseMode: "single" });
    const res = await chatPost(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-api-warn")).toBeNull();
    expect(res.headers.get("deprecation")).toBeNull();
    expect(res.headers.get("sunset")).toBeNull();
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

  it("returns contextual continuation when previous assistant message has single slang term", async () => {
    const req = makeRequest({
      message: "e isso?",
      history: [
        {
          role: "assistant",
          content: 'A gíria "slay" é usada como elogio.',
        },
      ],
    });
    const res = await chatPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.response).toContain("pela conversa anterior");
    expect(json.response).toContain("Leitura rápida");
  });
});
