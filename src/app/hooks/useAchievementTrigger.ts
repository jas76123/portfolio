"use client";

import { useEffect } from "react";
import { useGameState } from "./useGameState";
import type { AchievementId } from "../components/game/types";

/**
 * Срабатывает один раз когда:
 * - Game Mode активен
 * - условие true
 * - ачивка ещё не unlocked
 */
export function useAchievementTrigger(id: AchievementId, conditionMet: boolean): void {
  const { state, unlockAchievement } = useGameState();

  useEffect(() => {
    if (!state.gameMode) return;
    if (!conditionMet) return;
    if (state.achievements.includes(id)) return;
    unlockAchievement(id);
  }, [id, conditionMet, state.gameMode, state.achievements, unlockAchievement]);
}
