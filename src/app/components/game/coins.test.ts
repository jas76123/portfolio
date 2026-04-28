import { describe, it, expect } from "vitest";
import { COINS } from "./coins";
import type { CoinId } from "./types";

describe("COINS", () => {
  it("has exactly 5 coins", () => {
    expect(COINS.length).toBe(5);
  });

  it("ids are unique", () => {
    const ids = COINS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains expected ids", () => {
    const ids = COINS.map((c) => c.id);
    const expected: CoinId[] = [
      "coin_hero",
      "coin_skill",
      "coin_carousel",
      "coin_navbar",
      "coin_footer",
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });
});
