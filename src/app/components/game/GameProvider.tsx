"use client";

import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { reducer } from "./reducer";
import { DEFAULT_STATE, type PortfolioState, type AchievementId, type CoinId } from "./types";
import { loadState, saveState, resetState as wipeStorage } from "./persistence";
import { useKonamiCode } from "../../hooks/useKonamiCode";

type ContextValue = {
  state: PortfolioState;
  toggleGameMode: () => void;
  unlockAchievement: (id: AchievementId) => void;
  collectCoin: (id: CoinId) => void;
  setBossDefeated: () => void;
  setAudioMuted: (muted: boolean) => void;
  setCursorTrailEnabled: (enabled: boolean) => void;
  resetProgress: () => void;
  /** Last achievement unlocked (for HUDToast). Null until consumed. */
  lastUnlocked: AchievementId | null;
  consumeLastUnlocked: () => void;
  /** True only during the 1.5s activation cutscene. False on hydration restore. */
  cutsceneVisible: boolean;
};

const GameContext = createContext<ContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const hydratedRef = useRef(false);
  const prevAchievementsRef = useRef<AchievementId[]>(DEFAULT_STATE.achievements);
  const [lastUnlocked, setLastUnlocked] = useState<AchievementId | null>(null);
  const [cutsceneVisible, setCutsceneVisible] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    dispatch({ type: "HYDRATE", state: saved });
    prevAchievementsRef.current = saved.achievements;
    hydratedRef.current = true;
  }, []);

  // Persist on every state change (after hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveState(state);
  }, [state]);

  // Detect newly unlocked achievement (skip during hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    const prev = prevAchievementsRef.current;
    const next = state.achievements;
    const newlyAdded = next.filter((id) => !prev.includes(id));
    if (newlyAdded.length > 0) {
      setLastUnlocked(newlyAdded[newlyAdded.length - 1]);
    }
    prevAchievementsRef.current = next;
  }, [state.achievements]);

  // Auto-unlock first_contact when entering Game Mode
  useEffect(() => {
    if (state.gameMode && !state.achievements.includes("first_contact")) {
      dispatch({ type: "UNLOCK_ACHIEVEMENT", id: "first_contact" });
    }
  }, [state.gameMode, state.achievements]);

  // Konami code unlocks konami_master, only in Game Mode
  useKonamiCode(() => {
    dispatch({ type: "UNLOCK_ACHIEVEMENT", id: "konami_master" });
  }, state.gameMode);

  const value: ContextValue = {
    state,
    toggleGameMode: () => {
      // Show cutscene only when entering game mode (off → on)
      if (!state.gameMode) {
        setCutsceneVisible(true);
        setTimeout(() => setCutsceneVisible(false), 1500);
      }
      dispatch({ type: "TOGGLE_GAME_MODE" });
    },
    unlockAchievement: (id) => dispatch({ type: "UNLOCK_ACHIEVEMENT", id }),
    collectCoin: (id) => dispatch({ type: "COLLECT_COIN", id }),
    setBossDefeated: () => dispatch({ type: "SET_BOSS_DEFEATED" }),
    setAudioMuted: (muted) => dispatch({ type: "SET_AUDIO_MUTED", muted }),
    setCursorTrailEnabled: (enabled) => dispatch({ type: "SET_CURSOR_TRAIL", enabled }),
    resetProgress: () => {
      wipeStorage();
      dispatch({ type: "RESET_PROGRESS" });
      prevAchievementsRef.current = [];
      setLastUnlocked(null);
      setCutsceneVisible(false);
    },
    lastUnlocked,
    consumeLastUnlocked: () => setLastUnlocked(null),
    cutsceneVisible,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext(): ContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGameContext must be used inside <GameProvider>");
  return ctx;
}
