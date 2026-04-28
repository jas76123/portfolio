"use client";

import { useState } from "react";
import { useGameState } from "../../../hooks/useGameState";
import { ACHIEVEMENTS } from "../achievements";

export function HUDAchievements() {
  const { state } = useGameState();
  const [expanded, setExpanded] = useState(false);

  if (!state.gameMode) return null;

  const total = ACHIEVEMENTS.length;
  const unlocked = state.achievements.length;

  return (
    <div className="hud-achievements">
      <button
        className="hud-achievements-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? "Свернуть ачивки" : "Развернуть ачивки"}
      >
        ★ {unlocked}/{total}
      </button>

      {expanded && (
        <div className="hud-achievements-grid" role="list">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = state.achievements.includes(a.id);
            return (
              <div
                key={a.id}
                role="listitem"
                className={`hud-achievement ${isUnlocked ? "is-unlocked" : "is-locked"}`}
                title={`${a.title}: ${a.description}`}
              >
                <span className="hud-achievement-icon">{isUnlocked ? a.icon : "?"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
