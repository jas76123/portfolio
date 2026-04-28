# Game Mode Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать опциональный «Game Mode» — персистентный игровой слой поверх обычного портфолио: toggle, HUD, 8 ачивок (из 10; `contract_signed` и `master_hirer` отложены в Plan C), 5 монет treasure hunt, Konami code, persistence в localStorage.

**Architecture:** Centralized `GameProvider` Context с pure-reducer'ом для testable state. Все слотовые компоненты (`<Coin id="..." />`) инжектятся в существующие сервер-компоненты, рендерятся только при `gameMode=true`. HUD-виджеты — overlay, монтируются в `layout.tsx` за `<CursorTrail />`. Автоматическая re-check логика для `master_hirer` встроена в reducer (хоть он и unlockable только в Plan C). Тестирование — vitest + happy-dom для pure reducer/persistence/констант.

**Tech Stack:** Next 16, React 19, TypeScript 5, Tailwind 4. Новые dev-зависимости: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `happy-dom`, `@vitejs/plugin-react`. Никаких новых runtime-зависимостей.

**Out of Plan B scope (in Plan C):** Boss fight mini-game, audio (chiptune + ZzFX sfx), форма в Contacts, `contract_signed` и `master_hirer` triggers.

---

## Pre-task: контекст и risk register

**Контекст:**
- Spec: `docs/superpowers/specs/2026-04-28-portfolio-gamification-design.md`.
- Plan A (`polish-layer`) уже в main. Мы наследуем `RevealOnScroll`, `usePrefersReducedMotion`, `useScrollReveal` хуки, `globals.css` keyframes (`fadeIn`, `glitch`, `shake`, `pixelFade`).
- AGENTS.md в корне репозитория требует читать `node_modules/next/dist/docs/` перед написанием Next-кода.
- Static export (`output: "export"`), basePath `/portfolio`, gh-pages deploy. Любой client-код должен работать без SSR-only API.
- Все игровые модули — `"use client"`. State поднимается в layout через GameProvider.

**Главные риски:**

1. **Hydration mismatch.** GameProvider читает localStorage. Нельзя читать его при первом render — иначе SSR/CSR расхождение. Митигация: SSR с `DEFAULT_STATE`, hydration через `useEffect` (action `HYDRATE`).
2. **Coins инжектятся в server components.** `<Coin>` сам — client component. Server-компонент может рендерить client-child. Никаких props server→client кроме сериализуемых.
3. **Achievement triggers внутри существующих компонентов.** Wire-up через хук `useAchievementTrigger(id, conditionMet)` — должно быть тонким, не загрязнять основную логику. Триггер фигурирует только когда `gameMode=true`.
4. **Konami code не должен срабатывать в обычном режиме.** Listener активен только при `gameMode=true`.
5. **vitest setup в Next 16 + Tailwind 4 + React 19 — может потребовать тонкой настройки.** Готовы сделать минимальный setup с `happy-dom`.
6. **Persistence версионирование.** Schema `version: 1`. Если localStorage содержит другую версию или повреждён — fallback на DEFAULT_STATE с записью.

---

## File map

**Создаются:**

```
vitest.config.ts
vitest.setup.ts
src/app/components/game/types.ts                 — типы ID и State
src/app/components/game/persistence.ts           — localStorage IO
src/app/components/game/persistence.test.ts
src/app/components/game/achievements.ts          — ACHIEVEMENTS константа
src/app/components/game/achievements.test.ts
src/app/components/game/coins.ts                 — COINS константа
src/app/components/game/coins.test.ts
src/app/components/game/reducer.ts               — pure reducer
src/app/components/game/reducer.test.ts
src/app/components/game/GameProvider.tsx
src/app/components/game/GameToggleButton.tsx
src/app/components/game/ActivationCutscene.tsx
src/app/components/game/HUD/HUDTopBar.tsx
src/app/components/game/HUD/HUDAchievements.tsx
src/app/components/game/HUD/HUDToast.tsx
src/app/components/game/HUD/HUDControls.tsx
src/app/components/game/Coin.tsx
src/app/components/Navbar.tsx                    — новый компонент с GameToggleButton
src/app/components/Footer.tsx                    — новый компонент с coin
src/app/hooks/useGameState.ts
src/app/hooks/useAchievementTrigger.ts
src/app/hooks/useViewportDwell.ts                — для background_check (3s в viewport)
src/app/hooks/useKonamiCode.ts
```

**Модифицируются:**

```
package.json                                     — devDependencies + test script
src/app/layout.tsx                               — GameProvider + HUD widgets
src/app/page.tsx                                 — Navbar, Footer (если ещё не используются — проверить)
src/app/globals.css                              — стили HUD-виджетов и cutscene
src/app/components/Hero.tsx                      — <Coin id="coin_hero" /> внутри photo
src/app/components/About.tsx                    — useAchievementTrigger для background_check
src/app/components/Skills.tsx                    — <Coin id="coin_skill" /> + stat_inspection trigger
src/app/components/Projects.tsx                 — <Coin id="coin_carousel" /> + app_reviewer/storefront_auditor/code_inspector triggers
```

**Замечание по Navbar/Footer:** проверить `src/app/page.tsx` — есть ли там Navbar и Footer уже. Если нет, их нужно создать и подключить.

---

## Task 1: Установить vitest + testing dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Добавить dev-зависимости**

```bash
cd /Users/jasminagababyan/portfolio
npm install -D vitest@^2 @testing-library/react@^16 @testing-library/jest-dom@^6 happy-dom @vitejs/plugin-react
```

- [ ] **Step 2: Добавить test script в package.json**

В `package.json` блок `"scripts"` добавить:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Verify install**

```bash
npx vitest --version
```

Expected: версия ≥2.x.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add vitest + testing-library dev dependencies"
```

---

## Task 2: Конфигурация vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Создать `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 2: Создать `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Smoke test — запустить vitest на пустом наборе**

```bash
npm test 2>&1 | tail -10
```

Expected: vitest стартует, ищет файлы в `src/**/*.test.{ts,tsx}` (нет файлов — `0 tests`).

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts vitest.setup.ts
git commit -m "Add vitest config with happy-dom environment"
```

---

## Task 3: Типы и default state (`types.ts`)

**Files:**
- Create: `src/app/components/game/types.ts`

- [ ] **Step 1: Создать `src/app/components/game/types.ts`**

```ts
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
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -5
```

Expected: green.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/game/types.ts
git commit -m "Add Game Mode types and default state"
```

---

## Task 4: Persistence — TDD failing test

**Files:**
- Create: `src/app/components/game/persistence.test.ts`

- [ ] **Step 1: Написать failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, resetState } from "./persistence";
import { DEFAULT_STATE, STORAGE_KEY } from "./types";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns DEFAULT_STATE when no localStorage data", () => {
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it("returns DEFAULT_STATE when localStorage data is invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it("returns DEFAULT_STATE when version mismatch", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_STATE, version: 999 }));
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it("returns saved state when valid", () => {
    const state = { ...DEFAULT_STATE, gameMode: true, achievements: ["first_contact" as const] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState()).toEqual(state);
  });

  it("persists state via saveState", () => {
    const state = { ...DEFAULT_STATE, gameMode: true };
    saveState(state);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(state);
  });

  it("removes state via resetState", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    resetState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
```

- [ ] **Step 2: Run — должен FAIL**

```bash
npm test 2>&1 | tail -10
```

Expected: FAIL with "Cannot find module './persistence'".

---

## Task 5: Persistence — implementation

**Files:**
- Create: `src/app/components/game/persistence.ts`

- [ ] **Step 1: Реализовать**

```ts
import { DEFAULT_STATE, STORAGE_KEY, type PortfolioState } from "./types";

export function loadState(): PortfolioState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: PortfolioState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, quota) — silent
  }
}

export function resetState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}
```

- [ ] **Step 2: Run tests — должен PASS**

```bash
npm test 2>&1 | tail -10
```

Expected: 6 tests passing.

- [ ] **Step 3: Build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/app/components/game/persistence.ts src/app/components/game/persistence.test.ts
git commit -m "Add persistence module with version check + safe fallback"
```

---

## Task 6: Achievements константа — TDD test

**Files:**
- Create: `src/app/components/game/achievements.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS } from "./achievements";
import type { AchievementId } from "./types";

describe("ACHIEVEMENTS", () => {
  it("has exactly 10 achievements", () => {
    expect(ACHIEVEMENTS.length).toBe(10);
  });

  it("each achievement has id, title, description, icon", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.icon).toBeTruthy();
    }
  });

  it("ids are unique", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains expected ids", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    const expected: AchievementId[] = [
      "first_contact",
      "background_check",
      "stat_inspection",
      "app_reviewer",
      "storefront_auditor",
      "code_inspector",
      "treasure_hunter",
      "konami_master",
      "contract_signed",
      "master_hirer",
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });
});
```

- [ ] **Step 2: Run — FAIL**

```bash
npm test -- achievements 2>&1 | tail -8
```

---

## Task 7: Achievements константа — implementation

**Files:**
- Create: `src/app/components/game/achievements.ts`

- [ ] **Step 1: Implement**

```ts
import type { AchievementId } from "./types";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_contact",      title: "First Contact",       description: "Активировал Game Mode",                       icon: "🎮" },
  { id: "background_check",   title: "Background Check",    description: "Прочитал секцию About",                        icon: "📜" },
  { id: "stat_inspection",    title: "Stat Inspection",     description: "Изучил все навыки",                            icon: "⚔️" },
  { id: "app_reviewer",       title: "App Reviewer",        description: "Пролистал все скриншоты VocabMaster",          icon: "📱" },
  { id: "storefront_auditor", title: "Storefront Auditor",  description: "Пролистал все скриншоты Hello Kitty Store",    icon: "🛍️" },
  { id: "code_inspector",     title: "Code Inspector",      description: "Открыл GitHub-проект",                         icon: "🌐" },
  { id: "treasure_hunter",    title: "Treasure Hunter",     description: "Собрал все 5 монет",                           icon: "💎" },
  { id: "konami_master",      title: "Konami Master",       description: "↑↑↓↓←→←→BA",                                  icon: "🕹️" },
  { id: "contract_signed",    title: "Contract Signed",     description: "Отправил контактную форму",                    icon: "📝" },
  { id: "master_hirer",       title: "Master Hirer",        description: "Собрал все ачивки и победил босса",            icon: "👑" },
];
```

- [ ] **Step 2: Tests pass**

```bash
npm test -- achievements 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/game/achievements.ts src/app/components/game/achievements.test.ts
git commit -m "Add ACHIEVEMENTS constant with 10 entries"
```

---

## Task 8: Coins константа — TDD test

**Files:**
- Create: `src/app/components/game/coins.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from "vitest";
import { COINS } from "./coins";
import type { CoinId } from "./types";

describe("COINS", () => {
  it("has exactly 5 coins", () => {
    expect(COINS.length).toBe(5);
  });

  it("ids are unique", () => {
    const ids = COINS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains expected ids", () => {
    const ids = COINS.map((c) => c.id);
    const expected: CoinId[] = [
      "coin_hero",
      "coin_skill",
      "coin_carousel",
      "coin_navbar",
      "coin_footer",
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });
});
```

- [ ] **Step 2: Run — FAIL**

```bash
npm test -- coins 2>&1 | tail -5
```

---

## Task 9: Coins константа — implementation

**Files:**
- Create: `src/app/components/game/coins.ts`

- [ ] **Step 1: Implement**

```ts
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
```

- [ ] **Step 2: Test pass + commit**

```bash
npm test -- coins 2>&1 | tail -5
git add src/app/components/game/coins.ts src/app/components/game/coins.test.ts
git commit -m "Add COINS constant with 5 entries"
```

---

## Task 10: Pure reducer — TDD test

**Files:**
- Create: `src/app/components/game/reducer.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from "vitest";
import { reducer } from "./reducer";
import { DEFAULT_STATE } from "./types";

describe("reducer", () => {
  it("TOGGLE_GAME_MODE flips gameMode", () => {
    const next = reducer(DEFAULT_STATE, { type: "TOGGLE_GAME_MODE" });
    expect(next.gameMode).toBe(true);
    const back = reducer(next, { type: "TOGGLE_GAME_MODE" });
    expect(back.gameMode).toBe(false);
  });

  it("UNLOCK_ACHIEVEMENT adds id once", () => {
    const s1 = reducer(DEFAULT_STATE, { type: "UNLOCK_ACHIEVEMENT", id: "first_contact" });
    expect(s1.achievements).toEqual(["first_contact"]);
    const s2 = reducer(s1, { type: "UNLOCK_ACHIEVEMENT", id: "first_contact" });
    expect(s2.achievements).toEqual(["first_contact"]);
    const s3 = reducer(s2, { type: "UNLOCK_ACHIEVEMENT", id: "background_check" });
    expect(s3.achievements).toEqual(["first_contact", "background_check"]);
  });

  it("COLLECT_COIN adds id once", () => {
    const s1 = reducer(DEFAULT_STATE, { type: "COLLECT_COIN", id: "coin_hero" });
    expect(s1.coinsFound).toEqual(["coin_hero"]);
    const s2 = reducer(s1, { type: "COLLECT_COIN", id: "coin_hero" });
    expect(s2.coinsFound).toEqual(["coin_hero"]);
  });

  it("COLLECT_COIN auto-unlocks treasure_hunter on 5th coin", () => {
    let s = DEFAULT_STATE;
    const ids = ["coin_hero", "coin_skill", "coin_carousel", "coin_navbar", "coin_footer"] as const;
    for (const id of ids) {
      s = reducer(s, { type: "COLLECT_COIN", id });
    }
    expect(s.coinsFound).toHaveLength(5);
    expect(s.achievements).toContain("treasure_hunter");
  });

  it("master_hirer auto-unlocks when 9 prereqs + bossDefeated", () => {
    const nineAchievements = [
      "first_contact",
      "background_check",
      "stat_inspection",
      "app_reviewer",
      "storefront_auditor",
      "code_inspector",
      "treasure_hunter",
      "konami_master",
      "contract_signed",
    ] as const;
    const withNine = { ...DEFAULT_STATE, achievements: [...nineAchievements] };
    const next = reducer(withNine, { type: "SET_BOSS_DEFEATED" });
    expect(next.bossDefeated).toBe(true);
    expect(next.achievements).toContain("master_hirer");
  });

  it("master_hirer does NOT unlock without bossDefeated", () => {
    const nineAchievements = [
      "first_contact",
      "background_check",
      "stat_inspection",
      "app_reviewer",
      "storefront_auditor",
      "code_inspector",
      "treasure_hunter",
      "konami_master",
      "contract_signed",
    ] as const;
    const withNine = { ...DEFAULT_STATE, achievements: [...nineAchievements] };
    const next = reducer(withNine, { type: "UNLOCK_ACHIEVEMENT", id: "background_check" });
    expect(next.achievements).not.toContain("master_hirer");
  });

  it("RESET_PROGRESS returns DEFAULT_STATE", () => {
    const dirty = { ...DEFAULT_STATE, gameMode: true, achievements: ["first_contact" as const] };
    expect(reducer(dirty, { type: "RESET_PROGRESS" })).toEqual(DEFAULT_STATE);
  });

  it("HYDRATE replaces state with payload", () => {
    const payload = { ...DEFAULT_STATE, gameMode: true };
    expect(reducer(DEFAULT_STATE, { type: "HYDRATE", state: payload })).toEqual(payload);
  });
});
```

- [ ] **Step 2: Run — FAIL**

```bash
npm test -- reducer 2>&1 | tail -10
```

---

## Task 11: Pure reducer — implementation

**Files:**
- Create: `src/app/components/game/reducer.ts`

- [ ] **Step 1: Implement**

```ts
import type { AchievementId, CoinId, PortfolioState } from "./types";

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

import { DEFAULT_STATE } from "./types";

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
```

- [ ] **Step 2: Tests pass**

```bash
npm test -- reducer 2>&1 | tail -10
```

Expected: 8 passing.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/game/reducer.ts src/app/components/game/reducer.test.ts
git commit -m "Add pure reducer with master_hirer + treasure_hunter auto-checks"
```

---

## Task 12: GameProvider Context

**Files:**
- Create: `src/app/components/game/GameProvider.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from "react";
import { reducer, type Action } from "./reducer";
import { DEFAULT_STATE, type PortfolioState, type AchievementId, type CoinId } from "./types";
import { loadState, saveState, resetState as wipeStorage } from "./persistence";

type ContextValue = {
  state: PortfolioState;
  toggleGameMode: () => void;
  unlockAchievement: (id: AchievementId) => void;
  collectCoin: (id: CoinId) => void;
  setBossDefeated: () => void;
  setAudioMuted: (muted: boolean) => void;
  setCursorTrailEnabled: (enabled: boolean) => void;
  resetProgress: () => void;
  /** Last achievement unlocked (for HUDToast). Resets to null after read by toast component. */
  lastUnlocked: AchievementId | null;
  consumeLastUnlocked: () => void;
};

const GameContext = createContext<ContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const hydratedRef = useRef(false);
  const lastUnlockedRef = useRef<AchievementId | null>(null);
  const prevAchievementsRef = useRef<AchievementId[]>(DEFAULT_STATE.achievements);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    dispatch({ type: "HYDRATE", state: saved });
    hydratedRef.current = true;
  }, []);

  // Persist on every state change (after hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveState(state);
  }, [state]);

  // Track newly unlocked achievement for toast
  useEffect(() => {
    const prev = prevAchievementsRef.current;
    const next = state.achievements;
    const newlyAdded = next.filter((id) => !prev.includes(id));
    if (newlyAdded.length > 0) {
      lastUnlockedRef.current = newlyAdded[newlyAdded.length - 1];
    }
    prevAchievementsRef.current = next;
  }, [state.achievements]);

  const value: ContextValue = {
    state,
    toggleGameMode: () => dispatch({ type: "TOGGLE_GAME_MODE" }),
    unlockAchievement: (id) => dispatch({ type: "UNLOCK_ACHIEVEMENT", id }),
    collectCoin: (id) => dispatch({ type: "COLLECT_COIN", id }),
    setBossDefeated: () => dispatch({ type: "SET_BOSS_DEFEATED" }),
    setAudioMuted: (muted) => dispatch({ type: "SET_AUDIO_MUTED", muted }),
    setCursorTrailEnabled: (enabled) => dispatch({ type: "SET_CURSOR_TRAIL", enabled }),
    resetProgress: () => {
      wipeStorage();
      dispatch({ type: "RESET_PROGRESS" });
    },
    get lastUnlocked() {
      return lastUnlockedRef.current;
    },
    consumeLastUnlocked: () => {
      lastUnlockedRef.current = null;
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext(): ContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGameContext must be used inside <GameProvider>");
  return ctx;
}
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/game/GameProvider.tsx
git commit -m "Add GameProvider with hydrate + persist effects"
```

---

## Task 13: useGameState hook

**Files:**
- Create: `src/app/hooks/useGameState.ts`

- [ ] **Step 1: Implement**

```ts
"use client";

export { useGameContext as useGameState } from "../components/game/GameProvider";
```

Это просто re-export для удобства потребителей. Все игровые компоненты будут импортировать `useGameState` из `hooks/`.

- [ ] **Step 2: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/hooks/useGameState.ts
git commit -m "Add useGameState hook (re-export of useGameContext)"
```

---

## Task 14: Замонтировать GameProvider в layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Заменить layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { CursorTrail } from "./components/animations/CursorTrail";
import { GameProvider } from "./components/game/GameProvider";

export const metadata: Metadata = {
  title: "Жасмин Агабабян — Портфолио",
  description: "Персональное портфолио разработчика Жасмин Агабабян. Проекты, навыки и контакты.",
  keywords: ["портфолио", "разработчик", "Kotlin", "Flutter", "React", "Python"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GameProvider>
          {children}
          <CursorTrail />
        </GameProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Build + Commit**

```bash
npm run build 2>&1 | tail -5
git add src/app/layout.tsx
git commit -m "Wrap app in GameProvider"
```

---

## Task 15: GameToggleButton

**Files:**
- Create: `src/app/components/game/GameToggleButton.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useGameState } from "../../hooks/useGameState";

export function GameToggleButton() {
  const { state, toggleGameMode } = useGameState();
  const label = state.gameMode ? "EXIT GAME" : "PRESS START";

  return (
    <button
      onClick={toggleGameMode}
      className="game-toggle-btn"
      style={{
        fontFamily: "var(--pixel-font)",
        fontSize: "10px",
      }}
      aria-label={state.gameMode ? "Выйти из игрового режима" : "Включить игровой режим"}
    >
      {state.gameMode ? "👋" : "👾"} {label}
    </button>
  );
}
```

- [ ] **Step 2: Добавить стили в `src/app/globals.css`**

В конец, перед `@media (prefers-reduced-motion: reduce)`:

```css
.game-toggle-btn {
  background: var(--accent);
  color: #fff;
  border: 3px solid var(--foreground);
  box-shadow: 3px 3px 0 0 var(--foreground);
  padding: 8px 14px;
  cursor: pointer;
  transition: transform 100ms;
  animation: blink 2s ease-in-out infinite;
}

.game-toggle-btn:hover {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 0 var(--foreground);
}

.game-toggle-btn:active {
  transform: translate(3px, 3px);
  box-shadow: none;
  animation: none;
}
```

И в блок `@media (prefers-reduced-motion: reduce)` добавить:
```css
.game-toggle-btn { animation: none; }
.game-toggle-btn:hover { transform: none; box-shadow: 3px 3px 0 0 var(--foreground); }
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/game/GameToggleButton.tsx src/app/globals.css
git commit -m "Add GameToggleButton with PRESS START / EXIT GAME labels"
```

---

## Task 16: Navbar component

**Files:**
- Create: `src/app/components/Navbar.tsx`
- Modify: `src/app/page.tsx` (если Navbar ещё не используется)

- [ ] **Step 1: Прочитать `src/app/page.tsx`**

```bash
cat /Users/jasminagababyan/portfolio/src/app/page.tsx
```

Зафиксировать текущую структуру — есть ли Navbar и Footer уже.

- [ ] **Step 2: Создать Navbar**

```tsx
import { GameToggleButton } from "./game/GameToggleButton";

const links = [
  { href: "#hero", label: "Главная" },
  { href: "#about", label: "О мне" },
  { href: "#skills", label: "Навыки" },
  { href: "#projects", label: "Проекты" },
  { href: "#contacts", label: "Контакты" },
];

export default function Navbar() {
  return (
    <nav className="pixel-nav fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between">
      <span
        className="text-foreground"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
      >
        Jasmine
      </span>

      <ul className="hidden md:flex gap-6 items-center">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-foreground hover:text-accent"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <GameToggleButton />
    </nav>
  );
}
```

- [ ] **Step 3: Включить Navbar в page.tsx**

Если page.tsx уже содержит Navbar — добавить только `<Navbar />` в начало (если его нет). Если Navbar отсутствует, добавить импорт и использование. Пример итогового page.tsx:

```tsx
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contacts from "./components/Contacts";
// import Footer from "./components/Footer"; // — добавим в Task 17

export default function Page() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contacts />
      {/* <Footer /> — Task 17 */}
    </>
  );
}
```

**Замечание:** если у вас уже подключены другие компоненты в page.tsx — сохраните их. Главное — Navbar должен быть зарендерен.

- [ ] **Step 4: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/Navbar.tsx src/app/page.tsx
git commit -m "Add Navbar with GameToggleButton"
```

---

## Task 17: Footer component (с слотом для coin_footer)

**Files:**
- Create: `src/app/components/Footer.tsx`
- Modify: `src/app/page.tsx` (добавить `<Footer />`)

- [ ] **Step 1: Создать Footer**

```tsx
export default function Footer() {
  return (
    <footer className="section-alt py-8 px-6 border-t-4 border-foreground mt-auto">
      <div className="max-w-4xl mx-auto text-center">
        <p
          className="text-foreground"
          style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
        >
          {/* coin_footer слот — добавим в Task 28 */}
          © 2026 Жасмин Агабабян. Made with ❤️
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Подключить в page.tsx**

Раскомментировать / добавить `<Footer />` в page.tsx.

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/Footer.tsx src/app/page.tsx
git commit -m "Add Footer component"
```

---

## Task 18: ActivationCutscene

**Files:**
- Create: `src/app/components/game/ActivationCutscene.tsx`
- Modify: `src/app/globals.css` (стили cutscene)

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useGameState } from "../../hooks/useGameState";

const CUTSCENE_MS = 1500;

export function ActivationCutscene() {
  const { state } = useGameState();
  const [visible, setVisible] = useState(false);
  const [activatedAt, setActivatedAt] = useState<number | null>(null);

  useEffect(() => {
    if (state.gameMode && activatedAt === null) {
      setActivatedAt(Date.now());
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), CUTSCENE_MS);
      return () => clearTimeout(timer);
    }
    if (!state.gameMode) {
      setActivatedAt(null);
      setVisible(false);
    }
  }, [state.gameMode, activatedAt]);

  if (!visible) return null;

  return (
    <div className="game-cutscene-overlay" aria-hidden="true">
      <div className="game-cutscene-text">GAME MODE ACTIVATED</div>
    </div>
  );
}
```

- [ ] **Step 2: CSS в globals.css**

В конец (перед reduced-motion блоком):

```css
.game-cutscene-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 200ms ease-out;
}

.game-cutscene-text {
  font-family: var(--pixel-font);
  font-size: 24px;
  color: var(--accent);
  text-align: center;
  animation: glitch 500ms steps(8, end) infinite;
}
```

В блок reduced-motion добавить:
```css
.game-cutscene-overlay { animation: none; }
.game-cutscene-text { animation: none; }
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/game/ActivationCutscene.tsx src/app/globals.css
git commit -m "Add ActivationCutscene 1.5s overlay"
```

---

## Task 19: HUDTopBar

**Files:**
- Create: `src/app/components/game/HUD/HUDTopBar.tsx`
- Modify: `src/app/globals.css` (HUD стили)

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useGameState } from "../../../hooks/useGameState";
import { ACHIEVEMENTS } from "../achievements";
import { COINS } from "../coins";

export function HUDTopBar() {
  const { state } = useGameState();
  if (!state.gameMode) return null;

  const totalAchievements = ACHIEVEMENTS.length;
  const totalCoins = COINS.length;

  return (
    <div className="hud-top-bar" role="status" aria-live="polite">
      <span className="hud-quest">QUEST: HIRE THE DEVELOPER</span>
      <span className="hud-stat">★ {state.achievements.length}/{totalAchievements}</span>
      <span className="hud-stat">🪙 {state.coinsFound.length}/{totalCoins}</span>
    </div>
  );
}
```

- [ ] **Step 2: CSS**

```css
.hud-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: var(--foreground);
  color: var(--accent);
  font-family: var(--pixel-font);
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 90;
  border-bottom: 2px solid var(--accent);
}

.hud-quest {
  letter-spacing: 1px;
}

.hud-stat {
  white-space: nowrap;
}

/* shift content down when HUD active — applied via body class in Task 24 */
body.hud-active {
  padding-top: 32px;
}
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/game/HUD/HUDTopBar.tsx src/app/globals.css
git commit -m "Add HUDTopBar with quest title, achievement and coin counters"
```

---

## Task 20: HUDToast

**Files:**
- Create: `src/app/components/game/HUD/HUDToast.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Implement**

```tsx
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
```

- [ ] **Step 2: CSS**

```css
.hud-toast {
  position: fixed;
  top: 48px;
  right: 16px;
  background: var(--foreground);
  color: var(--accent);
  border: 3px solid var(--accent);
  padding: 12px 16px;
  font-family: var(--pixel-font);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 95;
  animation: hudToastSlide 300ms ease-out;
  max-width: 300px;
}

@keyframes hudToastSlide {
  from { transform: translateX(120%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

.hud-toast-icon { font-size: 20px; }
.hud-toast-title { font-size: 8px; color: var(--accent-light); margin-bottom: 4px; }
.hud-toast-name { font-size: 11px; }
```

В блок reduced-motion:
```css
.hud-toast { animation: none; }
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/game/HUD/HUDToast.tsx src/app/globals.css
git commit -m "Add HUDToast for achievement unlock notifications"
```

---

## Task 21: HUDAchievements (collapsible tray)

**Files:**
- Create: `src/app/components/game/HUD/HUDAchievements.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Implement**

```tsx
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
```

- [ ] **Step 2: CSS**

```css
.hud-achievements {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 90;
  font-family: var(--pixel-font);
}

.hud-achievements-toggle {
  background: var(--foreground);
  color: var(--accent);
  border: 3px solid var(--accent);
  padding: 8px 14px;
  font-family: var(--pixel-font);
  font-size: 11px;
  cursor: pointer;
}

.hud-achievements-toggle:hover {
  background: var(--accent);
  color: var(--foreground);
}

.hud-achievements-grid {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 6px;
  display: grid;
  grid-template-columns: repeat(5, 32px);
  gap: 4px;
  background: var(--foreground);
  border: 3px solid var(--accent);
  padding: 8px;
}

.hud-achievement {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--accent);
  background: rgba(0, 0, 0, 0.5);
}

.hud-achievement.is-locked .hud-achievement-icon {
  color: var(--accent-light);
  opacity: 0.4;
  font-size: 16px;
}

.hud-achievement.is-unlocked {
  background: var(--accent);
}

.hud-achievement-icon { font-size: 18px; }
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/game/HUD/HUDAchievements.tsx src/app/globals.css
git commit -m "Add HUDAchievements collapsible tray"
```

---

## Task 22: HUDControls (exit + reset)

**Files:**
- Create: `src/app/components/game/HUD/HUDControls.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useGameState } from "../../../hooks/useGameState";

export function HUDControls() {
  const { state, toggleGameMode, resetProgress } = useGameState();

  if (!state.gameMode) return null;

  const onReset = () => {
    if (confirm("Сбросить весь прогресс? Это нельзя отменить.")) {
      resetProgress();
    }
  };

  return (
    <div className="hud-controls">
      <button
        onClick={toggleGameMode}
        className="hud-control-btn"
        aria-label="Выйти из игрового режима"
      >
        ⏏ EXIT
      </button>
      <button
        onClick={onReset}
        className="hud-control-btn hud-control-danger"
        aria-label="Сбросить прогресс"
      >
        ⟲ RESET
      </button>
    </div>
  );
}
```

- [ ] **Step 2: CSS**

```css
.hud-controls {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 90;
  display: flex;
  gap: 6px;
}

.hud-control-btn {
  background: var(--foreground);
  color: var(--accent);
  border: 2px solid var(--accent);
  padding: 6px 10px;
  font-family: var(--pixel-font);
  font-size: 10px;
  cursor: pointer;
}

.hud-control-btn:hover {
  background: var(--accent);
  color: var(--foreground);
}

.hud-control-danger {
  border-color: #e74c3c;
  color: #e74c3c;
}

.hud-control-danger:hover {
  background: #e74c3c;
  color: var(--foreground);
}
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/game/HUD/HUDControls.tsx src/app/globals.css
git commit -m "Add HUDControls (exit + reset progress)"
```

---

## Task 23: Замонтировать все HUD-виджеты в layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Расширить layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { CursorTrail } from "./components/animations/CursorTrail";
import { GameProvider } from "./components/game/GameProvider";
import { ActivationCutscene } from "./components/game/ActivationCutscene";
import { HUDTopBar } from "./components/game/HUD/HUDTopBar";
import { HUDToast } from "./components/game/HUD/HUDToast";
import { HUDAchievements } from "./components/game/HUD/HUDAchievements";
import { HUDControls } from "./components/game/HUD/HUDControls";
import { HUDBodyClass } from "./components/game/HUDBodyClass";

export const metadata: Metadata = {
  title: "Жасмин Агабабян — Портфолио",
  description: "Персональное портфолио разработчика Жасмин Агабабян. Проекты, навыки и контакты.",
  keywords: ["портфолио", "разработчик", "Kotlin", "Flutter", "React", "Python"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GameProvider>
          <HUDBodyClass />
          <HUDTopBar />
          {children}
          <HUDToast />
          <HUDAchievements />
          <HUDControls />
          <ActivationCutscene />
          <CursorTrail />
        </GameProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Создать HUDBodyClass — добавляет/убирает класс `hud-active` на body**

`src/app/components/game/HUDBodyClass.tsx`:

```tsx
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
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/layout.tsx src/app/components/game/HUDBodyClass.tsx
git commit -m "Mount all HUD widgets and HUDBodyClass in root layout"
```

---

## Task 24: useAchievementTrigger hook

**Files:**
- Create: `src/app/hooks/useAchievementTrigger.ts`

- [ ] **Step 1: Implement**

```ts
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
```

- [ ] **Step 2: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/hooks/useAchievementTrigger.ts
git commit -m "Add useAchievementTrigger hook"
```

---

## Task 25: Wire `first_contact` (auto на активацию)

**Files:**
- Modify: `src/app/components/game/GameProvider.tsx`

`first_contact` = «активировал Game Mode». Удобнее всего диспатчить unlock прямо после toggleGameMode внутри Provider'а — или добавить эффект.

- [ ] **Step 1: Добавить эффект внутри GameProvider**

В `GameProvider.tsx`, рядом с другими useEffect'ами, добавить:

```tsx
// Auto-unlock first_contact when entering Game Mode
useEffect(() => {
  if (state.gameMode && !state.achievements.includes("first_contact")) {
    dispatch({ type: "UNLOCK_ACHIEVEMENT", id: "first_contact" });
  }
}, [state.gameMode, state.achievements]);
```

- [ ] **Step 2: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/game/GameProvider.tsx
git commit -m "Auto-unlock first_contact on Game Mode activation"
```

---

## Task 26: useViewportDwell hook + wire `background_check`

**Files:**
- Create: `src/app/hooks/useViewportDwell.ts`
- Modify: `src/app/components/About.tsx`

- [ ] **Step 1: Создать useViewportDwell**

```ts
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Возвращает [ref, dwellMet]. dwellMet=true когда элемент находился в viewport
 * непрерывно ≥ dwellMs.
 */
export function useViewportDwell<T extends HTMLElement = HTMLElement>(
  dwellMs = 3000,
  threshold = 0.2
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [dwellMet, setDwellMet] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (timer) return;
          timer = setTimeout(() => {
            setDwellMet(true);
            observer.disconnect();
          }, dwellMs);
        } else {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [dwellMs, threshold]);

  return [ref, dwellMet];
}
```

- [ ] **Step 2: Wire в About.tsx**

About.tsx сейчас server-component. Чтобы использовать hook, нужно сделать секцию client. Решение: extract crossroads — создать тонкий client-обёрточный компонент `AboutSectionTracker.tsx` который только трекает dwell и rendering детей.

Создать `src/app/components/AboutSectionTracker.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { useViewportDwell } from "../hooks/useViewportDwell";
import { useAchievementTrigger } from "../hooks/useAchievementTrigger";

export function AboutSectionTracker({ children }: { children: ReactNode }) {
  const [ref, dwellMet] = useViewportDwell<HTMLDivElement>(3000, 0.2);
  useAchievementTrigger("background_check", dwellMet);

  return <div ref={ref}>{children}</div>;
}
```

В `About.tsx` обернуть содержимое:

```tsx
import { RevealOnScroll } from "./animations/RevealOnScroll";
import { AboutSectionTracker } from "./AboutSectionTracker";

export default function About() {
  return (
    <section id="about" className="section-alt py-20 px-6">
      <AboutSectionTracker>
        <div className="max-w-4xl mx-auto">
          {/* существующее содержимое About без изменений */}
          <RevealOnScroll>
            <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
              Обо мне
            </h2>
          </RevealOnScroll>

          <RevealOnScroll delayMs={150}>
            <div className="pixel-card p-8 md:p-12">
              <p
                className="text-foreground leading-relaxed"
                style={{ fontFamily: "var(--pixel-font)", fontSize: "12px", lineHeight: "2.2" }}
              >
                Привет! Меня зовут Жасмин, я разработчик из г. Сочи.
                Создаю мобильные и веб-приложения, работаю с различными
                технологиями от мобильной разработки на Flutter и Kotlin
                до фронтенда на React и Next.js. Люблю решать интересные
                задачи и создавать полезные продукты.
              </p>

              <div className="mt-8 flex gap-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2"
                    style={{
                      background: i % 2 === 0 ? "var(--accent)" : "var(--accent-light)",
                    }}
                  />
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </AboutSectionTracker>
    </section>
  );
}
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/hooks/useViewportDwell.ts src/app/components/AboutSectionTracker.tsx src/app/components/About.tsx
git commit -m "Wire background_check trigger via 3s viewport dwell on About"
```

---

## Task 27: Wire `stat_inspection` trigger в Skills

**Files:**
- Modify: `src/app/components/Skills.tsx`

Условие: пользователь сделал `pointerenter` (hover на desktop / tap на mobile) на ВСЕ 12 skill-карточек. Реализуем как client wrapper над всем grid'ом, отслеживающий взаимодействие с каждым элементом по индексу.

- [ ] **Step 1: Создать `src/app/components/SkillsTracker.tsx`**

```tsx
"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useAchievementTrigger } from "../hooks/useAchievementTrigger";

export function SkillsTracker({
  totalSkills,
  children,
}: {
  totalSkills: number;
  children: (registerSkill: (index: number) => () => void) => ReactNode;
}) {
  const [touched, setTouched] = useState<Set<number>>(() => new Set());

  const registerSkill = useCallback((index: number) => {
    return () => setTouched((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  useAchievementTrigger("stat_inspection", touched.size >= totalSkills);

  return <>{children(registerSkill)}</>;
}
```

- [ ] **Step 2: Заменить содержимое Skills.tsx целиком**

```tsx
import { RevealOnScroll } from "./animations/RevealOnScroll";
import { SkillsTracker } from "./SkillsTracker";

const skills = [
  { name: "Kotlin", color: "#7F52FF", icon: "kotlin" },
  { name: "Flutter", color: "#02569B", icon: "flutter" },
  { name: "Dart", color: "#0175C2", icon: "dart" },
  { name: "Python", color: "#3776AB", icon: "python" },
  { name: "JavaScript", color: "#F7DF1E", icon: "javascript" },
  { name: "TypeScript", color: "#3178C6", icon: "typescript" },
  { name: "React", color: "#61DAFB", icon: "react" },
  { name: "Next.js", color: "#000000", icon: "nextdotjs" },
  { name: "SQL", color: "#336791", icon: "postgresql" },
  { name: "HTML/CSS", color: "#E34F26", icon: "html5" },
  { name: "Tailwind", color: "#06B6D4", icon: "tailwindcss" },
  { name: "Git", color: "#F05032", icon: "git" },
];

export default function Skills() {
  return (
    <section id="skills" className="section-light py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            Навыки
          </h2>
        </RevealOnScroll>

        <SkillsTracker totalSkills={skills.length}>
          {(registerSkill) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {skills.map((skill, i) => {
                const handle = registerSkill(i);
                return (
                  <RevealOnScroll key={skill.name} delayMs={i * 50}>
                    <div
                      className="pixel-card p-4 flex flex-col items-center gap-3 text-center"
                      onPointerEnter={handle}
                      onTouchStart={handle}
                    >
                      <div
                        className="w-14 h-14 flex items-center justify-center border-3 border-foreground rounded-none float"
                        style={{
                          background: skill.color,
                          animationDelay: `${(i % 5) * 0.2}s`,
                        }}
                      >
                        <img
                          src={`https://cdn.simpleicons.org/${skill.icon}/white`}
                          alt={skill.name}
                          className="w-8 h-8"
                          loading="lazy"
                        />
                      </div>
                      <span
                        className="text-foreground"
                        style={{ fontFamily: "var(--pixel-font)", fontSize: "9px" }}
                      >
                        {skill.name}
                      </span>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </SkillsTracker>
      </div>
    </section>
  );
}
```

**Замечание:** Skills.tsx становится server-component с client-child. Сохранить весь существующий список `skills`.

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/SkillsTracker.tsx src/app/components/Skills.tsx
git commit -m "Wire stat_inspection trigger via pointer/touch tracking on Skills"
```

---

## Task 28: Wire `app_reviewer`, `storefront_auditor`, `code_inspector` в Projects

**Files:**
- Modify: `src/app/components/Projects.tsx`

Все три триггера живут в client-component'е `ProjectCard` (Projects.tsx уже `"use client"`).

- [ ] **Step 1: Расширить массив `projects` (добавить `achievementId`)**

Найти в `Projects.tsx` массив `projects` и заменить целиком на:

```tsx
const projects = [
  {
    title: "VocabMaster",
    achievementId: "app_reviewer" as const,
    description:
      "Мобильное приложение для изучения иностранных слов с флеш-карточками. Русско-английский и англо-русский словарь с возможностью добавления и запоминания слов.",
    tech: ["Flutter", "Dart", "SQLite"],
    github: "https://github.com/jas76123/vocabmaster",
    images: [
      `${BASE_PATH}/images/projects/vocabmaster/1.png`,
      `${BASE_PATH}/images/projects/vocabmaster/2.png`,
    ],
  },
  {
    title: "Hello Kitty Store",
    achievementId: "storefront_auditor" as const,
    description:
      "Интернет-магазин товаров Hello Kitty с каталогом, фильтрацией по категориям и ценам, корзиной покупок, страницами About и Contact.",
    tech: ["React", "JavaScript", "CSS"],
    github: "https://github.com/jas76123/HK",
    images: [
      `${BASE_PATH}/images/projects/hk/1.png`,
      `${BASE_PATH}/images/projects/hk/2.png`,
      `${BASE_PATH}/images/projects/hk/3.png`,
      `${BASE_PATH}/images/projects/hk/4.png`,
      `${BASE_PATH}/images/projects/hk/5.png`,
    ],
  },
];
```

Добавить в импорты (вверху файла, рядом с существующими):
```tsx
import { useAchievementTrigger } from "../hooks/useAchievementTrigger";
import { useGameState } from "../hooks/useGameState";
import type { AchievementId } from "./game/types";
```

Расширить `ProjectCard`:

```tsx
Заменить функцию `ProjectCard` целиком на:

```tsx
function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const { state, unlockAchievement } = useGameState();

  // Track every image shown
  useEffect(() => {
    setSeen((prev) => {
      if (prev.has(currentImg)) return prev;
      const next = new Set(prev);
      next.add(currentImg);
      return next;
    });
  }, [currentImg]);

  useAchievementTrigger(
    project.achievementId as AchievementId,
    seen.size >= project.images.length
  );

  // Preload all images for instant carousel switching
  useEffect(() => {
    project.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [project.images]);

  const onGitHubClick = () => {
    if (state.gameMode && !state.achievements.includes("code_inspector")) {
      unlockAchievement("code_inspector");
    }
  };

  return (
    <div className="pixel-card p-6">
      <div className="relative w-full aspect-video mb-6 border-4 border-foreground overflow-hidden bg-gray-100">
        {project.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${project.title} скриншот ${i + 1}`}
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: i === currentImg ? 1 : 0 }}
          />
        ))}

        {project.images.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentImg((prev) =>
                  prev === 0 ? project.images.length - 1 : prev - 1
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border-3 border-foreground px-2 py-1 carousel-nav-btn"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
            >
              {"<"}
            </button>
            <button
              onClick={() =>
                setCurrentImg((prev) =>
                  prev === project.images.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-3 border-foreground px-2 py-1 carousel-nav-btn"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
            >
              {">"}
            </button>
          </>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {project.images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className="w-3 h-3 border-2 border-foreground carousel-dot-btn"
            style={{
              background: i === currentImg ? "var(--accent)" : "transparent",
            }}
          />
        ))}
      </div>

      <h3
        className="text-foreground mb-3"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "16px" }}
      >
        {project.title}
      </h3>

      <p
        className="text-foreground mb-4"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "10px", lineHeight: "2" }}
      >
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {project.tech.map((t) => (
          <span key={t} className="skill-tag">
            {t}
          </span>
        ))}
      </div>

      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="pixel-btn inline-block"
        onClick={onGitHubClick}
      >
        GitHub
      </a>
    </div>
  );
}
```

Default-export `Projects()` (внизу файла) остаётся без изменений из Plan A — сохраняется текущая обёртка `<RevealOnScroll>` вокруг section-title и проектных карточек.

- [ ] **Step 2: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/Projects.tsx
git commit -m "Wire app_reviewer, storefront_auditor, code_inspector triggers"
```

---

## Task 29: Coin компонент

**Files:**
- Create: `src/app/components/game/Coin.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Implement Coin**

```tsx
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
```

- [ ] **Step 2: CSS**

```css
.game-coin {
  position: absolute;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  animation: coinPulse 1.5s ease-in-out infinite;
  z-index: 50;
}

@keyframes coinPulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px var(--accent)); }
  50%      { transform: scale(1.15); filter: drop-shadow(0 0 8px var(--accent)); }
}

.game-coin:hover {
  transform: scale(1.3);
}
```

В блок reduced-motion:
```css
.game-coin { animation: none; }
.game-coin:hover { transform: none; }
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/game/Coin.tsx src/app/globals.css
git commit -m "Add Coin slot component with pulse animation"
```

---

## Task 30: Разместить 5 монет

**Files:**
- Modify: `src/app/components/Hero.tsx`
- Modify: `src/app/components/Skills.tsx`
- Modify: `src/app/components/Projects.tsx`
- Modify: `src/app/components/Navbar.tsx`
- Modify: `src/app/components/Footer.tsx`

Каждая монета — `<Coin id="..." className="absolute ..." />`. Контейнер должен быть `relative`.

- [ ] **Step 1: coin_hero — внутри photo блока в Hero.tsx**

Импорт:
```tsx
import { Coin } from "./game/Coin";
```

Внутри `<div className="float"><PixelSpawn ...><div className="pixel-image ...">` добавить:

```tsx
<div className="pixel-image w-52 h-52 md:w-72 md:h-72 relative overflow-hidden">
  <img ... />
  <Coin id="coin_hero" className="top-4 right-4" />
</div>
```

- [ ] **Step 2: coin_skill — за иконкой Python (4-я скилл, index 3)**

В Skills.tsx (внутри SkillsTracker render-prop) — добавить Coin рядом с конкретной иконкой. Простейший подход — рендерить Coin поверх skill-карточки только для одного индекса:

```tsx
import { Coin } from "./game/Coin";

// внутри map:
<RevealOnScroll key={skill.name} delayMs={i * 50}>
  <div className="pixel-card p-4 flex flex-col items-center gap-3 text-center relative" ...>
    {/* существующее */}
    {i === 3 && <Coin id="coin_skill" className="top-1 right-1" />}
  </div>
</RevealOnScroll>
```

- [ ] **Step 3: coin_carousel — в HK-проекте на 3-й картинке**

В Projects.tsx внутри ProjectCard в карусели:

```tsx
import { Coin } from "./game/Coin";

// в карусели, рядом с навигационными кнопками:
{project.title === "Hello Kitty Store" && currentImg === 2 && (
  <Coin id="coin_carousel" className="bottom-4 right-4" />
)}
```

- [ ] **Step 4: coin_navbar — в одном из linkов**

Modify `Navbar.tsx`:

```tsx
import { Coin } from "./game/Coin";

// в jsx, оборачивая <span>Jasmine</span>:
<span className="relative ..." ...>
  Jasmine
  <Coin id="coin_navbar" className="-top-2 -right-3" />
</span>
```

- [ ] **Step 5: coin_footer — рядом с copyright**

Modify `Footer.tsx`:

```tsx
import { Coin } from "./game/Coin";

// внутри <p className="...">:
<p className="text-foreground relative inline-block" ...>
  © 2026 Жасмин Агабабян. Made with ❤️
  <Coin id="coin_footer" className="-top-2 -right-6" />
</p>
```

- [ ] **Step 6: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/components/Hero.tsx src/app/components/Skills.tsx src/app/components/Projects.tsx src/app/components/Navbar.tsx src/app/components/Footer.tsx
git commit -m "Place 5 treasure hunt coins in Hero, Skills, Projects carousel, Navbar, Footer"
```

---

## Task 31: useKonamiCode hook

**Files:**
- Create: `src/app/hooks/useKonamiCode.ts`
- Modify: `src/app/components/game/GameProvider.tsx` (mount listener)

- [ ] **Step 1: Создать useKonamiCode**

```ts
"use client";

import { useEffect } from "react";

const SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

export function useKonamiCode(onTriggered: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    let progress = 0;

    const handler = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = SEQUENCE[progress];
      if (key === expected) {
        progress++;
        if (progress === SEQUENCE.length) {
          progress = 0;
          onTriggered();
        }
      } else {
        progress = key === SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTriggered, enabled]);
}
```

- [ ] **Step 2: Подключить в GameProvider**

В `GameProvider.tsx` добавить импорт и хук:

```tsx
import { useKonamiCode } from "../../hooks/useKonamiCode";
// ...

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  // ... existing useEffects ...

  // Konami code unlocks konami_master, only in Game Mode
  useKonamiCode(() => {
    dispatch({ type: "UNLOCK_ACHIEVEMENT", id: "konami_master" });
  }, state.gameMode);

  // ... rest
}
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build 2>&1 | tail -3
git add src/app/hooks/useKonamiCode.ts src/app/components/game/GameProvider.tsx
git commit -m "Add Konami code listener (active only in Game Mode)"
```

---

## Task 32: Финальный QA + production build

**Files:** none

- [ ] **Step 1: Запустить tests**

```bash
npm test 2>&1 | tail -15
```

Expected: все тесты passing (persistence, achievements, coins, reducer).

- [ ] **Step 2: Запустить dev server**

```bash
npm run dev
```

Открыть `http://localhost:3000/portfolio/`.

- [ ] **Step 3: QA-чеклист (обычный режим — Plan A не должен сломаться)**

- [ ] Hero typing/spawn/parallax — без изменений
- [ ] Все scroll-reveal анимации работают
- [ ] CursorTrail работает
- [ ] Navbar показывает «👾 PRESS START» в правом углу с blink-анимацией
- [ ] Никаких HUD-элементов не видно

- [ ] **Step 4: QA-чеклист (Game Mode)**

- [ ] Клик на «PRESS START» → 1.5 сек cutscene «GAME MODE ACTIVATED»
- [ ] После cutscene появляются: top bar (`QUEST: HIRE THE DEVELOPER`), counters (`★ 1/10` уже из-за `first_contact`, `🪙 0/5`), achievement tray в правом нижнем, controls в левом нижнем
- [ ] Toast «★ ACHIEVEMENT UNLOCKED — First Contact» прилетел справа сверху, исчез через 3 сек
- [ ] Скроллим до About, ждём 3 сек → toast «Background Check»
- [ ] Скроллим до Skills, hover на каждую из 12 иконок (или tap на mobile) → toast «Stat Inspection»
- [ ] Скроллим до Projects, листаем все 2 картинки VocabMaster → toast «App Reviewer»
- [ ] Листаем все 5 картинок HK → toast «Storefront Auditor»; на 3-й картинке HK видна монета 🪙
- [ ] Кликаем монету в HK-карусели → счётчик `🪙 1/5`
- [ ] Находим и кликаем все 5 монет (Hero, Skills #4, HK#3, Navbar, Footer) → toast «Treasure Hunter»
- [ ] Кликаем GitHub-ссылку любого проекта → toast «Code Inspector»
- [ ] Вводим Konami `↑↑↓↓←→←→ba` → toast «Konami Master»
- [ ] Tray (правый нижний) — клик: разворачивается 5×2 grid из 10 ачивок, цветные unlock'нутые, серые `?` залоченные
- [ ] Reload браузера: все ачивки и монеты сохранены, gameMode=true восстановлен без cutscene
- [ ] EXIT → возвращаемся в обычный режим, прогресс сохранён
- [ ] Снова PRESS START → cutscene, HUD появляется с сохранёнными ачивками
- [ ] RESET → confirm → всё обнуляется, выходим из Game Mode

- [ ] **Step 5: Mobile QA**

В DevTools переключить viewport на iPhone 12 Pro:
- [ ] Game toggle button виден в navbar
- [ ] HUD top bar читабельный, не перекрывает контент
- [ ] HUD tray переходит в bottom-right (или адаптируется)
- [ ] Tap на skill-карточки регистрируется (touch start)
- [ ] Coin тапается

- [ ] **Step 6: Reduced-motion test**

DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`:
- [ ] CursorTrail отключён
- [ ] PixelSpawn мгновенный
- [ ] Cutscene без glitch (просто overlay)
- [ ] Coin не пульсирует
- [ ] Game toggle button не моргает

- [ ] **Step 7: Production build**

```bash
npm run build 2>&1 | tail -10
```

Expected: green, `out/` собран.

- [ ] **Step 8: Merge в main + push**

Закрыть dev server.

```bash
git checkout main
git merge --no-ff game-mode-core -m "Merge game-mode-core: GameProvider, HUD, 8 achievements, 5 coins, Konami"
git push origin main
gh run watch --repo jas76123/portfolio --exit-status
```

После завершения — открыть `https://jas76123.github.io/portfolio/` и пройти QA в проде.

---

## Self-review checklist (для имплементера до старта)

- [ ] vitest setup в Tasks 1-2 предшествует TDD-задачам (4-11)
- [ ] Все типы (`AchievementId`, `CoinId`, `PortfolioState`) определены в Task 3 и используются единообразно
- [ ] Pure reducer выделен в отдельный файл и unit-тестируется (Task 10-11)
- [ ] GameProvider персистит на каждое изменение state, hydrate в useEffect (избегаем SSR mismatch)
- [ ] master_hirer auto-check — в reducer, повторно-проверяется на UNLOCK_ACHIEVEMENT, COLLECT_COIN, SET_BOSS_DEFEATED
- [ ] treasure_hunter auto-unlock на 5-й монете — в reducer
- [ ] HUD-виджеты показываются только при `state.gameMode === true`
- [ ] Coin рендерится только при `gameMode && !alreadyCollected`
- [ ] Konami listener активен только в Game Mode
- [ ] Все триггеры (Tasks 25-28) делают единичный unlock — повторное событие no-op (защита через `state.achievements.includes`)
- [ ] Reduced-motion overrides добавлены для каждой новой keyframe-анимации
- [ ] Все игровые модули — `"use client"`, кроме чисто статических (Coin может быть `"use client"` потому что использует хуки)
