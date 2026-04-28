"use client";

import { useGameState } from "../../../hooks/useGameState";
import { ACHIEVEMENTS } from "../achievements";
import { COINS } from "../coins";

export function HUDTopBar() {
  const { state } = useGameState();
  if (!state.gameMode) return null;

  return (
    <div className="hud-top-bar" role="status" aria-live="polite">
      <span className="hud-quest">QUEST: HIRE THE DEVELOPER</span>
      <span className="hud-stat">★ {state.achievements.length}/{ACHIEVEMENTS.length}</span>
      <span className="hud-stat">🪙 {state.coinsFound.length}/{COINS.length}</span>
    </div>
  );
}
