"use client";

import { useGameState } from "../../hooks/useGameState";

export function GameToggleButton() {
  const { state, toggleGameMode } = useGameState();
  const label = state.gameMode ? "EXIT GAME" : "PRESS START";

  return (
    <button
      onClick={toggleGameMode}
      className="game-toggle-btn"
      style={{
        fontFamily: "var(--pixel-font)",
        fontSize: "10px",
      }}
      aria-label={state.gameMode ? "Выйти из игрового режима" : "Включить игровой режим"}
    >
      {state.gameMode ? "👋" : "👾"} {label}
    </button>
  );
}
