import { describe, expect, it } from "vitest";
import { analyzeSuggestionQuality } from "../src/lib/suggestion-quality";

describe("suggestion quality analysis", () => {
  it("recommends approval for complete high-confidence suggestions", () => {
    const result = analyzeSuggestionQuality({
      term: "farmar aura",
      meaning: "ganhar moral nas redes",
      context: "usado em comentários de tiktok",
      submitterEmail: "ana@email.com",
      submitterWhatsapp: "1199999999",
    }, 0.86);

    expect(result.recommendation).toBe("approve");
    expect(result.blockers).toHaveLength(0);
  });

  it("recommends rejection for obvious garbage", () => {
    const result = analyzeSuggestionQuality({
      term: "kkkkkkkkkk",
      meaning: "asdf",
      submitterEmail: "ana@email.com",
    }, 0.1);

    expect(result.recommendation).toBe("reject");
    expect(result.blockers.length).toBeGreaterThan(0);
  });
});
