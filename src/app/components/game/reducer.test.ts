import { describe, it, expect } from "vitest";
import { reducer } from "./reducer";
import { DEFAULT_STATE } from "./types";

describe("reducer", () => {
  it("TOGGLE_GAME_MODE flips gameMode", () => {
    const next = reducer(DEFAULT_STATE, { type: "TOGGLE_GAME_MODE" });
    expect(next.gameMode).toBe(true);
    const back = reducer(next, { type: "TOGGLE_GAME_MODE" });
    expect(back.gameMode).toBe(false);
  });

  it("UNLOCK_ACHIEVEMENT adds id once", () => {
    const s1 = reducer(DEFAULT_STATE, { type: "UNLOCK_ACHIEVEMENT", id: "first_contact" });
    expect(s1.achievements).toEqual(["first_contact"]);
    const s2 = reducer(s1, { type: "UNLOCK_ACHIEVEMENT", id: "first_contact" });
    expect(s2.achievements).toEqual(["first_contact"]);
    const s3 = reducer(s2, { type: "UNLOCK_ACHIEVEMENT", id: "background_check" });
    expect(s3.achievements).toEqual(["first_contact", "background_check"]);
  });

  it("COLLECT_COIN adds id once", () => {
    const s1 = reducer(DEFAULT_STATE, { type: "COLLECT_COIN", id: "coin_hero" });
    expect(s1.coinsFound).toEqual(["coin_hero"]);
    const s2 = reducer(s1, { type: "COLLECT_COIN", id: "coin_hero" });
    expect(s2.coinsFound).toEqual(["coin_hero"]);
  });

  it("COLLECT_COIN auto-unlocks treasure_hunter on 5th coin", () => {
    let s = DEFAULT_STATE;
    const ids = ["coin_hero", "coin_skill", "coin_carousel", "coin_navbar", "coin_footer"] as const;
    for (const id of ids) {
      s = reducer(s, { type: "COLLECT_COIN", id });
    }
    expect(s.coinsFound).toHaveLength(5);
    expect(s.achievements).toContain("treasure_hunter");
  });

  it("master_hirer auto-unlocks when 9 prereqs + bossDefeated", () => {
    const nineAchievements = [
      "first_contact",
      "background_check",
      "stat_inspection",
      "app_reviewer",
      "storefront_auditor",
      "code_inspector",
      "treasure_hunter",
      "konami_master",
      "contract_signed",
    ] as const;
    const withNine = { ...DEFAULT_STATE, achievements: [...nineAchievements] };
    const next = reducer(withNine, { type: "SET_BOSS_DEFEATED" });
    expect(next.bossDefeated).toBe(true);
    expect(next.achievements).toContain("master_hirer");
  });

  it("master_hirer does NOT unlock without bossDefeated", () => {
    const nineAchievements = [
      "first_contact",
      "background_check",
      "stat_inspection",
      "app_reviewer",
      "storefront_auditor",
      "code_inspector",
      "treasure_hunter",
      "konami_master",
      "contract_signed",
    ] as const;
    const withNine = { ...DEFAULT_STATE, achievements: [...nineAchievements] };
    const next = reducer(withNine, { type: "UNLOCK_ACHIEVEMENT", id: "background_check" });
    expect(next.achievements).not.toContain("master_hirer");
  });

  it("RESET_PROGRESS returns DEFAULT_STATE", () => {
    const dirty = { ...DEFAULT_STATE, gameMode: true, achievements: ["first_contact" as const] };
    expect(reducer(dirty, { type: "RESET_PROGRESS" })).toEqual(DEFAULT_STATE);
  });

  it("HYDRATE replaces state with payload", () => {
    const payload = { ...DEFAULT_STATE, gameMode: true };
    expect(reducer(DEFAULT_STATE, { type: "HYDRATE", state: payload })).toEqual(payload);
  });
});
