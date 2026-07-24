import { describe, expect, it } from "vitest";
import { SLANG_DATA } from "../src/lib/slang-data";

describe("slang data scale", () => {
  it("keeps the searchable slang dictionary above 10k deduplicated entries", () => {
    expect(SLANG_DATA.length).toBeGreaterThanOrEqual(10_000);
  });
});
