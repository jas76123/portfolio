"use client";

import { useGameState } from "../../../hooks/useGameState";

export function HUDControls() {
  const { state, toggleGameMode, resetProgress } = useGameState();

  if (!state.gameMode) return null;

  const onReset = () => {
    if (confirm("Сбросить весь прогресс? Это нельзя отменить.")) {
      resetProgress();
    }
  };

  return (
    <div className="hud-controls">
      <button
        onClick={toggleGameMode}
        className="hud-control-btn"
        aria-label="Выйти из игрового режима"
      >
        ⏏ EXIT
      </button>
      <button
        onClick={onReset}
        className="hud-control-btn hud-control-danger"
        aria-label="Сбросить прогресс"
      >
        ⟲ RESET
      </button>
    </div>
  );
}
