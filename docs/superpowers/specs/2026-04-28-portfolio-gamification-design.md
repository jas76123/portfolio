# Portfolio Gamification — Design Spec

**Дата:** 2026-04-28
**Проект:** `/Users/jasminagababyan/portfolio` (Next.js 16, React 19, static export → GitHub Pages)
**Статус:** Draft — pending user review

---

## 1. Контекст

Существующее портфолио (https://jas76123.github.io/portfolio/) — статичный одностраничник с pixel/retro-эстетикой (Press Start 2P, пиксельные рамки, кастомные курсоры). Секции: Hero, About, Skills, Projects (VocabMaster, Hello Kitty Store), Contacts. Цель сайта — конвертировать посетителя в клиента/работодателя.

Задача — добавить анимации и геймификацию для «вау-эффекта» при первом визите, сохраняя бизнес-смысл (ничего не должно отвлекать от конверсии в Contacts).

## 2. Цель и ограничения

**Цель:** опциональный игровой слой поверх обычного портфолио, который превращает воронку посетитель→клиент в RPG-метафору «Hire the Developer Quest».

**Ограничения:**
- Должно «иметь смысл и мэтчиться с информацией сайта» (явное требование пользователя): каждое игровое действие = шаг конверсионной воронки.
- Не должно блокировать обычного посетителя/рекрутёра: всё игровое — opt-in.
- Должно работать со static export на GitHub Pages (никакого SSR / API).
- Производительность: первая загрузка не должна деградировать, бюджет анимаций — compositor-only (transform/opacity).
- Доступность: respect для `prefers-reduced-motion`, клавиатурная навигация, mobile-friendly.

**Не цели:**
- Полноценный roguelike / многоуровневая игра.
- Серверная синхронизация прогресса (всё в localStorage).
- Многопользовательский / соревновательный режим.
- Локализация (сайт пока русскоязычный).

## 3. Смысловой стержень: «The Hiring Quest»

Посетитель — Quest-Giver (заказчик). Jasmine — кандидат. Game Mode превращает сайт в RPG-процесс собеседования. Метафора резонирует с реальной целью сайта (конверсия) и с существующим контентом без натяжек:

- About → Background Check
- Skills → Stat sheet кандидата
- Projects → Прошлые квесты (выполненные заказы)
- Contacts → Sign the contract (финальное конверсионное действие)

Геймификация = gamified CTA-воронка, переодетая в игру.

## 4. Архитектура двух режимов

| Аспект | Normal Mode (default) | Game Mode (opt-in) |
|---|---|---|
| Аудитория | Все, рекрутёры, нетерпеливые | Энтузиасты, гики, кто хочет поиграть |
| Активация | По умолчанию | Клик `[👾 PRESS START]` в navbar |
| Polish-анимации | ✅ Все | ✅ Все |
| HUD | ❌ | ✅ |
| Achievements | ❌ | ✅ (10 шт.) |
| Coins (treasure hunt) | ❌ | ✅ (5 шт.) |
| Boss fight | ❌ | ✅ (опционально) |
| Audio | ❌ | ✅ (default muted) |

State Game Mode сохраняется в localStorage. При повторном визите, если был включён, поднимается автоматически без катсцены.

---

## 5. HUD (Game Mode)

**Toggle:** в navbar (правый угол) — пиксельная кнопка `[👾 PRESS START]` с blink-анимацией. Hover показывает tooltip «Try Game Mode».

**Активация:** 1.5-секундная катсцена — затемнение, печатается «GAME MODE — ACTIVATED», пиксельный glitch-переход, появляются HUD-элементы.

**4 HUD-элемента:**

1. **Top bar (sticky под navbar, высота ~32px):** `QUEST: HIRE THE DEVELOPER` + прогресс ачивок `7/10` + счётчик монет `🪙 3/5`. Не перекрывает контент, sticky.

2. **Bottom-right achievement tray (collapsible):** иконки 8×8 пикселей в сетке. Заблокированные = серые силуэты, открытые = цветные. Клик по иконке = tooltip с названием и описанием. Свернутый вид — бейдж `[★ 7/10]`.

3. **Top-right toast:** при unlock'е ачивки слайдится 3-секундное уведомление: `★ ACHIEVEMENT UNLOCKED — Background Check` + sfx.

4. **Bottom-left mini-controls:** 🔊 audio toggle, `[EXIT GAME]`, `[RESET PROGRESS]`.

**Mobile:** top bar остаётся, tray — dock внизу, audio/exit — в гамбургер-меню.

**Принципы:**
- HUD никогда не двигает контент (overlay с `position: fixed` + z-index).
- Каждый HUD-элемент ≤32px по высоте/диаметру.
- Все элементы кроме top bar свёртываются.

---

## 6. Achievements (10 шт.)

| # | ID | Название | Триггер | Бизнес-смысл |
|---|----|----------|---------|--------------|
| 1 | `first_contact` | 🎮 First Contact | Активация Game Mode | Onboarding-награда |
| 2 | `background_check` | 📜 Background Check | About во viewport ≥3 сек | Прочитал bio |
| 3 | `stat_inspection` | ⚔️ Stat Inspection | Hover/tap на все skill-иконки | Изучил стек |
| 4 | `app_reviewer` | 📱 App Reviewer | Пролистал обе картинки VocabMaster | Изучил проект 1 |
| 5 | `storefront_auditor` | 🛍️ Storefront Auditor | Пролистал все 5 картинок HK | Изучил проект 2 |
| 6 | `code_inspector` | 🌐 Code Inspector | Клик по любой GitHub-ссылке | Доказательство реальности кода |
| 7 | `treasure_hunter` | 💎 Treasure Hunter | Собрал все 5 монет | Reward за исследование |
| 8 | `konami_master` | 🕹️ Konami Master | Ввёл `↑↑↓↓←→←→BA` | Easter egg для гиков |
| 9 | `contract_signed` | 📝 Contract Signed | Отправил contact-форму | **Главное конверсионное действие** |
| 10 | `master_hirer` | 👑 Master Hirer | Все 9 ачивок + победа над боссом | Endgame badge |

**Правила:**
- Ачивки даются **только в Game Mode**. Действия в обычном режиме не ретроактивны.
- Каждый unlock → toast (3 сек) + sfx + запись в localStorage.
- Дубль-триггеры игнорируются (если ачивка уже unlocked, повторное действие — no-op).
- `master_hirer` — special case: его условие (все 9 + `bossDefeated`) пере-проверяется на каждое изменение state (после любого unlock'а или после победы над боссом). То есть последнее действие, которое замыкает условие, автоматически даст финальную ачивку без отдельного триггера.

## 7. Treasure Hunt (5 монет)

Спрятаны в существующем контенте, видимы и кликабельны **только в Game Mode**.

| # | ID | Локация |
|---|----|---------|
| 1 | `coin_hero` | Внутри hero photo, hover на лицо аватара |
| 2 | `coin_skill` | За одной из иконок Skills, мерцает при близком наведении |
| 3 | `coin_carousel` | В углу карусели проектов на одной из картинок HK |
| 4 | `coin_navbar` | В букве «о» одного из пунктов navbar |
| 5 | `coin_footer` | В копирайте футера |

**Поведение:** клик → +1 на счётчик top bar, sfx `coin_pickup`, монета исчезает с пиксельным взрывом, запись в `coinsFound[]`. После сбора всех — unlock `treasure_hunter`.

---

## 8. Mini-game «Procrastination Demon» (Boss Fight)

**Где:** в секции Contacts, перед формой. Кнопка `[⚔️ CHALLENGE THE BOSS]` (видна только в Game Mode). Рядом маленькая `[skip →]` — игра никогда не блокирует контакт.

**Жанр:** Space Invaders-like, 30 секунд, один уровень. Canvas 480×320 в retro-фрейме.

**Геймплей:**
- **Игрок:** пиксельный ноутбук внизу, движение ←→ (стрелки/A-D / touch-зоны на мобильном)
- **Стрельба:** автоогонь по таймеру (упрощает механику)
- **Враги (3 типа):** 🐦 TikTok bird, 📺 Stream, 🛒 Shopping cart — иконки прокрастинации, спрайты 16×16, спускаются волнами
- **HP игрока:** 3 жизни (контакт = -1)
- **Цель:** перебить ≥15 врагов за 30 сек ИЛИ убить финального босса (появляется на 25-й сек)
- **Калибровка сложности:** ~70% побед с первой попытки

**Победа:**
- Катсцена 2 сек: «BOSS DEFEATED» + взрыв + jingle
- Форма автоматически разворачивается с предзаполненным сообщением: «Hi Jasmine! I defeated the Procrastination Demon and I want to discuss a project» (поля name/email пустые, message предзаполнен и редактируем)
- localStorage `bossDefeated: true`
- Если все ачивки 1–9 уже собраны → unlock `master_hirer`

**Поражение:**
- Катсцена «GAME OVER» 1.5 сек
- Кнопки `[TRY AGAIN]` и `[SKIP & USE NORMAL FORM]`
- Skip = форма раскрывается без предзаполнения

**Технически:**
- Vanilla JS, Canvas 2D, `requestAnimationFrame`
- Спрайты 16×16, нарисованные вручную (PNG-атлас или inline canvas drawing) — общий вес ≤10KB
- Lazy-loaded через `next/dynamic` (не нагружает первую загрузку)
- Доступность: touch на mobile, кнопка skip с клавиатуры (Tab + Enter)

---

## 9. Polish-анимации (обычный режим)

Видны **всем** посетителям, не только в Game Mode. Цель — мгновенный «вау» в первые 2 секунды без жертв в производительности.

**1. Hero (на load):**
- Имя печатается посимвольно (~50ms/char), мигающий курсор-палка в конце
- Аватар спавнится «пиксельной сборкой»: сетка 8×8 квадратов проявляется по диагонали за ~600ms
- Подзаголовок (роль) — fade-in после имени
- Background hero — лёгкий параллакс по движению мыши (transform translate ±5px max)

**2. Scroll-triggered (Intersection Observer, threshold 0.2):**
- Каждая секция: fade + slide-up (translateY 24px → 0, opacity 0 → 1, 500ms ease-out)
- Section-title: 200ms glitch-эффект — позиция дёргается ±2px по X с rgb-shift через text-shadow
- Карточки проектов: stagger-появление (100ms задержка)
- Skill-иконки: stagger-появление (50ms задержка)

**3. Hover/постоянные:**
- Skill-иконки: subtle floating motion (CSS keyframes, ±3px по Y, 3 сек цикл, рандомный delay)
- Карточки проектов: усиление существующего :hover — добавить rotate ±0.5deg
- Pixel buttons (.pixel-btn): на :active shake 100ms ±1px + sfx click (только в Game Mode)
- Carousel arrows/dots: на :hover scale 1.1 + усиление box-shadow

**4. Cursor trail (опционально, desktop only):**
- 3–5 пиксельных частиц 4×4px за курсором, fade-out за 400ms
- Реализация: `requestAnimationFrame`, частицы в pool (без создания DOM на каждое движение)
- Отключается полностью при `prefers-reduced-motion: reduce` или через HUD toggle (для тех, кому мешает)

**5. Глобально — `prefers-reduced-motion: reduce`:**
- Все вышеперечисленные анимации отключаются
- Контент остаётся доступным, никакой деградации UX

**Производительность:**
- Анимации только через `transform` и `opacity` (compositor-only, без reflow)
- JS-анимации (cursor trail, boss fight) throttled на 60fps
- Если cursor trail портит Lighthouse CLS/CPU → отключаем по умолчанию, оставляем opt-in в HUD

---

## 10. Persistence (localStorage)

**Single key:** `portfolio_state`

```ts
type PortfolioState = {
  version: 1;
  gameMode: boolean;
  achievements: AchievementId[];   // unlocked IDs
  coinsFound: CoinId[];            // collected IDs
  bossDefeated: boolean;
  audioMuted: boolean;             // default true
  cursorTrailEnabled: boolean;     // default true (с respect prefers-reduced-motion)
};
```

**Поведение:**
- На load: читаем state. Если `gameMode === true` → поднимаем игровой режим без катсцены (катсцена только при ручной активации).
- При unlock'е ачивки/сборе монеты/изменении настроек → запись.
- `[RESET PROGRESS]` в HUD → удаление ключа полностью.
- Версионирование: `version: 1`. При будущих изменениях схемы — миграция или сброс (явная стратегия закладывается в `persistence.ts`).
- Если localStorage недоступен (Safari private mode, etc.) → in-memory state, всё работает в рамках одного визита, на reload — сброс. Тихий fallback.

---

## 11. Audio

- **Background:** одна chiptune-петля (~30 сек, CC0 ассет, формат `.ogg` + `.mp3` fallback). Lazy-load — подгружается **только при активации Game Mode**.
- **SFX (4 звука):** `coin_pickup`, `achievement_unlock`, `button_click`, `boss_hit`. Inline-генерация через ZzFX (~3KB библиотеки, ноль файлов).
- **Volume:** 30% по умолчанию.
- **Default state:** muted. Звук включается только явным кликом на 🔊 в HUD (браузерные autoplay-policy + UX: неожиданный звук = выход).
- **Reduce-motion** не влияет на audio. Если в будущем добавим respect для `prefers-reduced-data` — можно гейтить background music.

---

## 12. Архитектура кода

```
src/app/
├── components/
│   ├── (existing: Hero, About, Skills, Projects, Contacts, Navbar, Footer)
│   └── game/
│       ├── GameProvider.tsx        # Context: state + actions (toggle, unlock, addCoin, reset)
│       ├── GameToggleButton.tsx    # PRESS START в navbar
│       ├── HUD/
│       │   ├── HUDTopBar.tsx       # quest title + progress + coins
│       │   ├── HUDAchievements.tsx # bottom-right tray
│       │   ├── HUDToast.tsx        # achievement unlock notifications
│       │   └── HUDControls.tsx     # bottom-left audio + exit + reset
│       ├── Coin.tsx                # инжектится в существующие компоненты
│       ├── BossFight.tsx           # canvas-игра, lazy-loaded
│       ├── CursorTrail.tsx         # desktop-only оверлей
│       ├── achievements.ts         # const ACHIEVEMENTS = [...]
│       ├── coins.ts                # const COINS = [...]
│       ├── audio.ts                # ZzFX wrappers + bg music control
│       └── persistence.ts          # localStorage read/write/reset/migrate
└── hooks/
    ├── useGameState.ts             # шорткат на GameProvider
    ├── useAchievementTrigger.ts    # хук срабатывания ачивки
    └── useScrollReveal.ts          # Intersection Observer для polish-секций
```

**Ключевые решения:**
- **GameProvider — единственный source of truth** для игрового состояния. Вкладывается в `layout.tsx`.
- **Polish-анимации независимы от GameProvider.** `useScrollReveal` работает всегда.
- **Lazy load BossFight** через `next/dynamic` — игра не загружается, пока не нужна.
- **Coins — slot-паттерн:** `<Coin id="coin_hero" />` инжектится внутрь существующих компонентов, рендерится только в Game Mode и если ID не в `coinsFound[]`. Существующие компоненты не переписываем под игру.
- **Hydration:** игровой HUD рендерится только после `useEffect` (избегаем SSR/CSR mismatch для localStorage state). Polish-анимации SSR-safe.
- **Next 16 + static export compatibility:** все игровые модули `"use client"`, не используют API/SSR-only фичи.
- **AGENTS.md обязательство:** перед реализацией любого Next-кода читать соответствующий гайд в `node_modules/next/dist/docs/` (Next 16 имеет breaking changes относительно тренинговых данных). Это требование зафиксировано в репозитории и должно быть учтено в плане реализации.

---

## 13. Acceptance criteria / QA checklist

**Должно работать:**
- [ ] Сайт загружается с polish-анимациями (Hero typing, scroll-fade, hover-эффекты), без HUD.
- [ ] Клик по `[👾 PRESS START]` в navbar → катсцена 1.5 сек → появляется HUD.
- [ ] Все 10 ачивок срабатывают на свои триггеры, показывают toast, сохраняются в localStorage.
- [ ] Все 5 монет видны и кликабельны только в Game Mode, исчезают после сбора, увеличивают счётчик.
- [ ] Konami code срабатывает в Game Mode на любом месте сайта.
- [ ] Boss fight запускается, в игре можно двигаться и стрелять, побеждать и проигрывать.
- [ ] При победе форма открывается с предзаполненным сообщением.
- [ ] При поражении доступен skip к обычной форме.
- [ ] Reload браузера сохраняет gameMode, ачивки, монеты, состояние босса.
- [ ] `[RESET PROGRESS]` обнуляет состояние полностью.
- [ ] `[EXIT GAME]` возвращает в обычный режим без потери прогресса.
- [ ] Mobile: HUD адаптивен, boss fight играется через touch, монеты тапаются.
- [ ] `prefers-reduced-motion: reduce` отключает все polish-анимации и cursor trail.
- [ ] Audio default muted, включается только по клику.
- [ ] Lighthouse Performance не падает ниже 85 для обычного режима (sanity check; можем калибровать).

**Не должно ломаться:**
- [ ] Существующая функциональность сайта работает без изменений в обычном режиме.
- [ ] Image carousel в Projects работает (мы НЕ ломаем существующее).
- [ ] Static export `npm run build` собирается без ошибок.
- [ ] GitHub Pages деплой через workflow проходит зелёным.

---

## 14. Out of scope (явно)

- Полноценный roguelike, многоуровневая игра, инвентарь.
- Серверная синхронизация прогресса, leaderboard, multiplayer.
- Локализация (EN-версия — отдельная задача).
- Полноценная музыкальная партитура (используем CC0 ассеты).
- Кастомный sound design (используем ZzFX-генерацию).
- Hard intro screen (явно отвергнут на этапе brainstorm).

## 15. Открытые вопросы (могут возникнуть на этапе writing-plans)

- Точный chiptune ассет (выберем на этапе реализации из CC0-каталога).
- Точные пиксельные спрайты для врагов в boss fight — хорошо бы черновики до старта канваса.
- Точная позиция coin_navbar в букве «о» — зависит от существующего markup'а navbar.
- Калибровка сложности boss fight (порог 15 врагов / 30 сек) может потребовать playtesting'а.
