import { describe, it, expect } from "vitest";
import { GET } from "../src/app/api/v1/suggestions/route";

describe("suggestions api", () => {
  it("returns items list shape", async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("items");
    expect(Array.isArray(data.items)).toBe(true);
  });
});
