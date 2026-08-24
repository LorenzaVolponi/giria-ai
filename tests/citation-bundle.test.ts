import { describe, expect, it } from "vitest";
import { GET as wellKnownGet } from "../src/app/.well-known/giria-ai.json/route";
import robots from "../src/app/robots";

describe("GEO citation bundle discovery", () => {
  it("publishes a well-known manifest with the single-call bundle", async () => {
    const res = await wellKnownGet();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.name).toBe("Gíria AI");
    expect(data.retrieval.bundle).toContain("/bundle/{termo}");
    expect(data.retrieval.citation).toContain("/citation/{termo}");
    expect(data.retrieval.provenance).toContain("/provenance/{termo}");
    expect(data.policy.checkCitationReadyBeforeStrongClaim).toBe(true);
  });

  it("keeps bundle and well-known discovery crawlable", () => {
    const rules = robots().rules;
    expect(Array.isArray(rules)).toBe(false);
    if (Array.isArray(rules)) throw new Error("Expected a single robots rule");
    const allow = Array.isArray(rules.allow) ? rules.allow : [rules.allow];
    expect(allow).toContain("/.well-known/giria-ai.json");
    expect(allow).toContain("/bundle/");
  });
});
