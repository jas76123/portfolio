"use client";

import { useEffect, useState } from "react";
import { useGameState } from "../../../hooks/useGameState";
import { ACHIEVEMENTS } from "../achievements";
import type { AchievementId } from "../types";

const TOAST_DURATION_MS = 3000;

export function HUDToast() {
  const { state, lastUnlocked, consumeLastUnlocked } = useGameState();
  const [visibleId, setVisibleId] = useState<AchievementId | null>(null);

  useEffect(() => {
    if (!state.gameMode) return;
    if (!lastUnlocked) return;
    setVisibleId(lastUnlocked);
    consumeLastUnlocked();
    const timer = setTimeout(() => setVisibleId(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [lastUnlocked, state.gameMode, consumeLastUnlocked]);

  if (!state.gameMode || !visibleId) return null;

  const achievement = ACHIEVEMENTS.find((a) => a.id === visibleId);
  if (!achievement) return null;

  return (
    <div className="hud-toast" role="status" aria-live="polite">
      <span className="hud-toast-icon">{achievement.icon}</span>
      <div className="hud-toast-body">
        <div className="hud-toast-title">★ ACHIEVEMENT UNLOCKED</div>
        <div className="hud-toast-name">{achievement.title}</div>
      </div>
    </div>
  );
}
