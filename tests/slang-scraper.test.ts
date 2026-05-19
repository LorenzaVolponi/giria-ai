import { describe, expect, it } from "vitest";
import { parseArgsFrom, sanitizeCandidates } from "../scripts/slang-scraper.mjs";

describe("slang-scraper helpers", () => {
  it("normalizes cli args with bounds", () => {
    const parsed = parseArgsFrom([
      "--limit",
      "99999",
      "--ud-pages",
      "0",
      "--concurrency",
      "99",
      "--min-score",
      "1.5",
      "--timeout-ms",
      "10",
    ]);

    expect(parsed.limit).toBe(99999);
    expect(parsed.udPages).toBe(1);
    expect(parsed.concurrency).toBe(20);
    expect(parsed.minScore).toBe(0.99);
    expect(parsed.timeoutMs).toBe(3000);
  });

  it("filters and sorts candidates by quality score", () => {
    const rows = [
      { term: "bora", meaning: "vamos agora", source: "wiktionary-pt-seed", region: "Brasil", category: "outros" },
      { term: "x", meaning: "ruim", source: "fallback-local", region: "Brasil", category: "outros" },
      { term: "http://junk", meaning: "junk", source: "fallback-local", region: "Brasil", category: "outros" },
      { term: "suave", meaning: "tranquilo mesmo de verdade", source: "fallback-local", region: "Brasil", category: "outros" },
    ];

    const out = sanitizeCandidates(rows, 0.5);
    expect(out.length).toBe(2);
    expect(out[0]?.term).toBe("bora");
    expect(out[1]?.term).toBe("suave");
    expect(out.every((item) => item.qualityScore >= 0.5)).toBe(true);
  });
});
