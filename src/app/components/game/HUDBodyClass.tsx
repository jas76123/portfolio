"use client";

import { useEffect } from "react";
import { useGameState } from "../../hooks/useGameState";

export function HUDBodyClass() {
  const { state } = useGameState();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (state.gameMode) {
      document.body.classList.add("hud-active");
    } else {
      document.body.classList.remove("hud-active");
    }
  }, [state.gameMode]);

  return null;
}
