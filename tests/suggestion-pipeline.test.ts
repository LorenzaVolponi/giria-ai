import { describe, it, expect } from "vitest";
import { isSuggestionEligible, validateSuggestionPayload } from "../src/lib/suggestion-pipeline";

describe("suggestion pipeline validation", () => {
  it("rejects missing fields", () => {
    const parsed = validateSuggestionPayload({ term: "", meaning: "", name: "", contact: "" });
    expect(parsed.ok).toBe(false);
  });

  it("rejects obvious garbage", () => {
    const parsed = validateSuggestionPayload({ term: "kkkkkkkkk", meaning: "asdf", name: "Foo", contact: "foo@bar.com" });
    expect(parsed.ok).toBe(false);
  });

  it("rejects mockery/caricature content", () => {
    const parsed = validateSuggestionPayload({
      term: "giria",
      meaning: "forma de zombaria com caricatura",
      context: "post em rede social",
      name: "Foo",
      contact: "foo@bar.com",
    });
    expect(parsed.ok).toBe(false);
  });

  it("flags borderline content for human review", () => {
    const parsed = validateSuggestionPayload({
      term: "termo polêmico",
      meaning: "discussão sobre apropriação cultural",
      context: "debate",
      name: "Ana",
      contact: "ana@email.com",
    });

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.moderation.decision).toBe("needs_human_review");
    }
  });

  it("rejects term without vowels", async () => {
    const parsed = await isSuggestionEligible("xtrm");
    expect(parsed.ok).toBe(false);
  });

  it("blocks offensive terms", async () => {
    const parsed = await isSuggestionEligible("otário");
    expect(parsed.ok).toBe(false);
  });

  it("accepts valid suggestion", () => {
    const parsed = validateSuggestionPayload({ term: "farmar aura", meaning: "tentar ganhar moral", context: "rede social", name: "Ana", contact: "ana@email.com" });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.moderation.decision).toBe("allowed");
    }
  });
});
