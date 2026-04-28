"use client";

import { useGameState } from "../../hooks/useGameState";

export function ActivationCutscene() {
  const { cutsceneVisible } = useGameState();

  if (!cutsceneVisible) return null;

  return (
    <div className="game-cutscene-overlay" aria-hidden="true">
      <div className="game-cutscene-text">GAME MODE ACTIVATED</div>
    </div>
  );
}
