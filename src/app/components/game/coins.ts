import type { CoinId } from "./types";

export type Coin = {
  id: CoinId;
  hint: string;
};

export const COINS: Coin[] = [
  { id: "coin_hero",     hint: "Где-то в Hero" },
  { id: "coin_skill",    hint: "За одной из иконок Skills" },
  { id: "coin_carousel", hint: "В карусели проектов" },
  { id: "coin_navbar",   hint: "В навигации" },
  { id: "coin_footer",   hint: "В футере" },
];
