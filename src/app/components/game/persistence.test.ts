import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, resetState } from "./persistence";
import { DEFAULT_STATE, STORAGE_KEY } from "./types";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns DEFAULT_STATE when no localStorage data", () => {
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it("returns DEFAULT_STATE when localStorage data is invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it("returns DEFAULT_STATE when version mismatch", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_STATE, version: 999 }));
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it("returns saved state when valid", () => {
    const state = { ...DEFAULT_STATE, gameMode: true, achievements: ["first_contact" as const] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState()).toEqual(state);
  });

  it("persists state via saveState", () => {
    const state = { ...DEFAULT_STATE, gameMode: true };
    saveState(state);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(state);
  });

  it("removes state via resetState", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    resetState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
