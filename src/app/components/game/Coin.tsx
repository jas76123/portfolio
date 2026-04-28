"use client";

import { useGameState } from "../../hooks/useGameState";
import type { CoinId } from "./types";

type Props = {
  id: CoinId;
  className?: string;
};

export function Coin({ id, className = "" }: Props) {
  const { state, collectCoin } = useGameState();

  if (!state.gameMode) return null;
  if (state.coinsFound.includes(id)) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        collectCoin(id);
      }}
      className={`game-coin ${className}`}
      aria-label="Подобрать монету"
    >
      🪙
    </button>
  );
}
