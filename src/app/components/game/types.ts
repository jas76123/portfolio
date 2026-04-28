export type AchievementId =
  | "first_contact"
  | "background_check"
  | "stat_inspection"
  | "app_reviewer"
  | "storefront_auditor"
  | "code_inspector"
  | "treasure_hunter"
  | "konami_master"
  | "contract_signed"
  | "master_hirer";

export type CoinId =
  | "coin_hero"
  | "coin_skill"
  | "coin_carousel"
  | "coin_navbar"
  | "coin_footer";

export type PortfolioState = {
  version: 1;
  gameMode: boolean;
  achievements: AchievementId[];
  coinsFound: CoinId[];
  bossDefeated: boolean;
  audioMuted: boolean;
  cursorTrailEnabled: boolean;
};

export const DEFAULT_STATE: PortfolioState = {
  version: 1,
  gameMode: false,
  achievements: [],
  coinsFound: [],
  bossDefeated: false,
  audioMuted: true,
  cursorTrailEnabled: true,
};

export const STORAGE_KEY = "portfolio_state";
