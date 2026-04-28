import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS } from "./achievements";
import type { AchievementId } from "./types";

describe("ACHIEVEMENTS", () => {
  it("has exactly 10 achievements", () => {
    expect(ACHIEVEMENTS.length).toBe(10);
  });

  it("each achievement has id, title, description, icon", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.icon).toBeTruthy();
    }
  });

  it("ids are unique", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains expected ids", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    const expected: AchievementId[] = [
      "first_contact",
      "background_check",
      "stat_inspection",
      "app_reviewer",
      "storefront_auditor",
      "code_inspector",
      "treasure_hunter",
      "konami_master",
      "contract_signed",
      "master_hirer",
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });
});
