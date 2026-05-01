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

  it("rejects term without vowels", async () => {
    const parsed = await isSuggestionEligible("xtrm");
    expect(parsed.ok).toBe(false);
  });

  it("accepts valid suggestion", () => {
    const parsed = validateSuggestionPayload({ term: "farmar aura", meaning: "tentar ganhar moral", context: "rede social", name: "Ana", contact: "ana@email.com" });
    expect(parsed.ok).toBe(true);
  });
});
