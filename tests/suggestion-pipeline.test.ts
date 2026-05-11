import { describe, expect, it } from "vitest";
import { autoPromoteApprovedSlang, isSuggestionEligible, validateSuggestionPayload } from "../src/lib/suggestion-pipeline";

describe("suggestion pipeline validation", () => {
  it("rejects missing fields", () => {
    const parsed = validateSuggestionPayload({ term: "", meaning: "", submitterName: "", submitterWhatsapp: "", submitterEmail: "" });
    expect(parsed.ok).toBe(false);
  });

  it("rejects obvious garbage", () => {
    const parsed = validateSuggestionPayload({ term: "kkkkkkkkk", meaning: "asdf", submitterName: "Foo", submitterWhatsapp: "+5511999999999", submitterEmail: "foo@bar.com" });
    expect(parsed.ok).toBe(false);
  });

  it("rejects term without vowels", async () => {
    const parsed = await isSuggestionEligible("xtrm");
    expect(parsed.ok).toBe(false);
  });

  it("rejects consonant-heavy artificial term", async () => {
    const parsed = await isSuggestionEligible("bcdfghjklmna");
    expect(parsed.ok).toBe(false);
  });

  it("accepts valid suggestion", () => {
    const parsed = validateSuggestionPayload({ term: "farmar aura", meaning: "tentar ganhar moral", context: "rede social", submitterName: "Ana", submitterWhatsapp: "+5511988887777", submitterEmail: "ana@email.com" });
    expect(parsed.ok).toBe(true);
  });

  it("accepts punctuation-rich meaning/context", () => {
    const parsed = validateSuggestionPayload({
      term: "lá ele",
      meaning: 'Significa "outra pessoa, não eu"; sai fora.',
      context: 'Uso em zoeira: "lá ele", para cortar duplo sentido.',
      submitterName: "João",
      submitterWhatsapp: "1199999999",
      submitterEmail: "joao@email.com",
    });
    expect(parsed.ok).toBe(true);
  });

  it("rejects oversized text payloads", () => {
    const parsed = validateSuggestionPayload({
      term: "g".repeat(41),
      meaning: "m".repeat(281),
      context: "c".repeat(281),
      submitterName: "Ana",
      submitterWhatsapp: "+5511988887777",
      submitterEmail: "ana@email.com",
    });
    expect(parsed.ok).toBe(false);
  });

  it("does not promote pending suggestions", async () => {
    const promoted = await autoPromoteApprovedSlang({
      term: "farmar aura",
      meaning: "tentar ganhar moral",
      context: "rede social",
      submitterName: "Ana",
      submitterWhatsapp: "+5511988887777",
      submitterEmail: "ana@email.com",
      status: "pending",
    });
    expect(promoted.promoted).toBe(false);
  });
});
