import { DEFAULT_STATE, type AchievementId, type CoinId, type PortfolioState } from "./types";

export type Action =
  | { type: "TOGGLE_GAME_MODE" }
  | { type: "UNLOCK_ACHIEVEMENT"; id: AchievementId }
  | { type: "COLLECT_COIN"; id: CoinId }
  | { type: "SET_BOSS_DEFEATED" }
  | { type: "SET_AUDIO_MUTED"; muted: boolean }
  | { type: "SET_CURSOR_TRAIL"; enabled: boolean }
  | { type: "RESET_PROGRESS" }
  | { type: "HYDRATE"; state: PortfolioState };

const TOTAL_COINS = 5;
const MASTER_HIRER_PREREQS: AchievementId[] = [
  "first_contact",
  "background_check",
  "stat_inspection",
  "app_reviewer",
  "storefront_auditor",
  "code_inspector",
  "treasure_hunter",
  "konami_master",
  "contract_signed",
];

function withMasterHirerCheck(state: PortfolioState): PortfolioState {
  if (state.achievements.includes("master_hirer")) return state;
  if (!state.bossDefeated) return state;
  const has = (id: AchievementId) => state.achievements.includes(id);
  if (MASTER_HIRER_PREREQS.every(has)) {
    return { ...state, achievements: [...state.achievements, "master_hirer"] };
  }
  return state;
}

function withTreasureHunterCheck(state: PortfolioState): PortfolioState {
  if (state.achievements.includes("treasure_hunter")) return state;
  if (state.coinsFound.length < TOTAL_COINS) return state;
  return { ...state, achievements: [...state.achievements, "treasure_hunter"] };
}

export function reducer(state: PortfolioState, action: Action): PortfolioState {
  switch (action.type) {
    case "TOGGLE_GAME_MODE":
      return { ...state, gameMode: !state.gameMode };

    case "UNLOCK_ACHIEVEMENT": {
      if (state.achievements.includes(action.id)) return state;
      const next = { ...state, achievements: [...state.achievements, action.id] };
      return withMasterHirerCheck(next);
    }

    case "COLLECT_COIN": {
      if (state.coinsFound.includes(action.id)) return state;
      const next = { ...state, coinsFound: [...state.coinsFound, action.id] };
      const afterTreasure = withTreasureHunterCheck(next);
      return withMasterHirerCheck(afterTreasure);
    }

    case "SET_BOSS_DEFEATED":
      return withMasterHirerCheck({ ...state, bossDefeated: true });

    case "SET_AUDIO_MUTED":
      return { ...state, audioMuted: action.muted };

    case "SET_CURSOR_TRAIL":
      return { ...state, cursorTrailEnabled: action.enabled };

    case "RESET_PROGRESS":
      return DEFAULT_STATE;

    case "HYDRATE":
      return action.state;
  }
}
