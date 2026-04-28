# Polish Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить слой polish-анимаций, видимый всем посетителям сайта, без активации Game Mode. Это первый из трёх планов из спеки `docs/superpowers/specs/2026-04-28-portfolio-gamification-design.md`.

**Architecture:** Маленькие client-компоненты-обёртки (`RevealOnScroll`, `TypingText`, `PixelSpawn`, `MouseParallax`, `CursorTrail`) и пара хуков (`useScrollReveal`, `useTypingEffect`, `usePrefersReducedMotion`). Где возможно — pure-CSS keyframes без JS (PixelSpawn, glitch на section-title, hover-эффекты). Существующие компоненты (Hero, About, Skills, Projects, Contacts) остаются server-component'ами; client-обёртки инжектируются точечно.

**Tech Stack:** Next 16 (app router, static export, basePath `/portfolio`), React 19, TypeScript 5, Tailwind 4. Никаких новых рантайм-зависимостей. Тестирование — manual smoke + `npm run build` (vitest добавим в Plan B).

**Out of Plan A scope:** GameProvider, HUD, achievements, coins, audio, boss fight (всё в Plan B и C).

---

## Pre-task: ознакомление и risk register

**Что нужно знать перед стартом:**

- `AGENTS.md` репозитория явно требует читать `node_modules/next/dist/docs/` перед написанием Next-кода — Next 16 имеет breaking changes относительно тренинговых данных моделей.
- Существующие компоненты (`Hero.tsx`, `Skills.tsx`, `About.tsx`, `Contacts.tsx`, `Projects.tsx`) — server components, без `"use client"`, кроме `Projects.tsx`.
- Деплой — static export → GitHub Pages с `basePath: "/portfolio"`. Любой client-компонент должен работать без SSR-only API.
- Существующая `globals.css` уже содержит `.float`, `.blink`, `.pixel-card`, `.pixel-btn`, `.section-title`. Реюзаем, не дублируем.
- Кастомный курсор задан глобальным `* { cursor: url(...) }` в `globals.css:26-27`. CursorTrail добавляет ЧАСТИЦЫ поверх — НЕ заменяет курсор.

**Главные риски:**

1. **Hydration mismatch** для компонентов, чьё начальное JS-state отличается от SSR-state (TypingText, RevealOnScroll). Митигация: SSR-state = «после анимации», client useEffect возвращает state в «до» и проигрывает. Браузер видит финальный HTML на первом frame, потом перематывает к началу — мгновенный flash, но не варнинг.
2. **Performance:** cursor trail на слабых машинах. Митигация: pool частиц, RAF-throttle, `prefers-reduced-motion: reduce` отключает.
3. **Existing `.float` на Hero декорациях** — не сломать.
4. **Gh-pages deploy:** убедиться что `npm run build && out/` собирается без ошибок после каждой группы задач.

---

## File map

**Создаются:**
- `src/app/components/animations/RevealOnScroll.tsx`
- `src/app/components/animations/TypingText.tsx`
- `src/app/components/animations/PixelSpawn.tsx`
- `src/app/components/animations/MouseParallax.tsx`
- `src/app/components/animations/CursorTrail.tsx`
- `src/app/hooks/usePrefersReducedMotion.ts`
- `src/app/hooks/useScrollReveal.ts`
- `src/app/hooks/useTypingEffect.ts`

**Модифицируются:**
- `src/app/globals.css` (новые keyframes, reveal-классы, hover/active правила, prefers-reduced-motion блок)
- `src/app/components/Hero.tsx` (TypingText на h1, PixelSpawn на photo, MouseParallax на background)
- `src/app/components/About.tsx` (обернуть в RevealOnScroll)
- `src/app/components/Skills.tsx` (RevealOnScroll + stagger; добавить `.float` к иконкам)
- `src/app/components/Projects.tsx` (RevealOnScroll + stagger; усилить hover на карточках; scale на кнопках карусели)
- `src/app/components/Contacts.tsx` (обернуть в RevealOnScroll)
- `src/app/layout.tsx` (mount CursorTrail)

---

## Task 1: Прочитать соответствующие гайды Next 16

**Files:**
- Read only: `node_modules/next/dist/docs/01-app/02-guides/`, `node_modules/next/dist/docs/01-app/01-getting-started/`, `node_modules/next/dist/docs/01-app/03-api-reference/`

- [ ] **Step 1: Прочитать гайд по client components**

Прочитать (если существует) гайд про Server vs Client Components в Next 16 — нужно для использования `"use client"` в новых компонентах.

```bash
find node_modules/next/dist/docs/ -name "*client*" -o -name "*server*" 2>/dev/null | head
ls node_modules/next/dist/docs/01-app/01-getting-started/
```

Открыть и прочитать релевантные `.md` файлы. Особое внимание — изменениям в hydration, RSC boundaries, supported hooks.

- [ ] **Step 2: Прочитать гайд по static export**

```bash
find node_modules/next/dist/docs/ -name "*export*" -o -name "*static*" 2>/dev/null | head
```

Убедиться что client components, useEffect, IntersectionObserver, requestAnimationFrame работают со static export. Подтвердить, что `output: "export"` не накладывает дополнительных ограничений на client-only логику.

- [ ] **Step 3: Прочитать гайд по metadata / globals.css**

Подтвердить, что путь `import "./globals.css"` в `layout.tsx` остался валидным в Next 16, что нет breaking change в импорте CSS.

- [ ] **Step 4: Зафиксировать находки**

Если обнаружились breaking changes, влияющие на план — обновить план перед продолжением. Иначе продолжать.

---

## Task 2: Добавить keyframes и утилитарные классы в globals.css

**Files:**
- Modify: `src/app/globals.css` (добавить в конец файла)

- [ ] **Step 1: Добавить новые keyframes**

В конец `src/app/globals.css` добавить:

```css
/* === Polish Layer animations === */

@keyframes glitch {
  0%   { transform: translateX(0); text-shadow: none; }
  20%  { transform: translateX(-2px); text-shadow: 2px 0 var(--accent), -2px 0 var(--accent-light); }
  40%  { transform: translateX(2px); text-shadow: -2px 0 var(--accent), 2px 0 var(--accent-light); }
  60%  { transform: translateX(-1px); text-shadow: 1px 0 var(--accent), -1px 0 var(--accent-light); }
  80%  { transform: translateX(1px); text-shadow: -1px 0 var(--accent), 1px 0 var(--accent-light); }
  100% { transform: translateX(0); text-shadow: none; }
}

@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-1px, 1px); }
  50%      { transform: translate(1px, -1px); }
  75%      { transform: translate(-1px, -1px); }
}

@keyframes pixelFade {
  from { opacity: 1; }
  to   { opacity: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* === Scroll-reveal utility classes === */

.reveal-on-scroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
  will-change: opacity, transform;
}

.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Section title glitch fires on first reveal */
.reveal-on-scroll.is-visible .section-title {
  animation: glitch 200ms steps(5, end) 1;
}

/* === Enhanced hover on existing pixel-card (project cards) === */

.pixel-card:hover {
  transform: translate(-2px, -2px) rotate(-0.5deg);
}

/* === Active shake on pixel-btn === */

.pixel-btn:active,
.pixel-btn-outline:active {
  animation: shake 100ms steps(4, end) 1;
}

/* === prefers-reduced-motion: disable everything we just added + existing motion === */

@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll,
  .reveal-on-scroll.is-visible {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .reveal-on-scroll.is-visible .section-title { animation: none; }
  .pixel-card:hover { transform: none; }
  .pixel-btn:active, .pixel-btn-outline:active { animation: none; }
  .float, .blink { animation: none !important; }
  [style*="animation: fadeIn"] { animation: none !important; opacity: 1 !important; }
}
```

- [ ] **Step 2: Сборка для проверки CSS-валидности**

```bash
cd /Users/jasminagababyan/portfolio
npm run build
```

Expected: build проходит, `out/_next/static/css/...` содержит новые keyframes (можно заглянуть в файл grep'ом). Если build падает на CSS — править синтаксис.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "Add glitch, shake, pixelFade keyframes and reveal utility classes"
```

---

## Task 3: Создать хук usePrefersReducedMotion

**Files:**
- Create: `src/app/hooks/usePrefersReducedMotion.ts`

- [ ] **Step 1: Создать файл**

Содержимое `src/app/hooks/usePrefersReducedMotion.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
```

- [ ] **Step 2: Проверить сборку**

```bash
npm run build
```

Expected: build проходит без TypeScript-ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/app/hooks/usePrefersReducedMotion.ts
git commit -m "Add usePrefersReducedMotion hook"
```

---

## Task 4: Создать хук useScrollReveal

**Files:**
- Create: `src/app/hooks/useScrollReveal.ts`

- [ ] **Step 1: Создать файл**

Содержимое `src/app/hooks/useScrollReveal.ts`:

```ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  threshold = 0.2
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            return;
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}
```

- [ ] **Step 2: Проверить сборку**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/hooks/useScrollReveal.ts
git commit -m "Add useScrollReveal hook (Intersection Observer, fires once)"
```

---

## Task 5: Создать компонент RevealOnScroll

**Files:**
- Create: `src/app/components/animations/RevealOnScroll.tsx`

- [ ] **Step 1: Создать файл**

Содержимое `src/app/components/animations/RevealOnScroll.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

type Props = {
  children: ReactNode;
  threshold?: number;
  delayMs?: number;
  as?: "div" | "section" | "article" | "li";
  className?: string;
};

export function RevealOnScroll({
  children,
  threshold = 0.2,
  delayMs = 0,
  as: Tag = "div",
  className = "",
}: Props) {
  const [ref, isVisible] = useScrollReveal<HTMLElement>(threshold);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`reveal-on-scroll ${isVisible ? "is-visible" : ""} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: Проверить сборку**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/animations/RevealOnScroll.tsx
git commit -m "Add RevealOnScroll component with optional stagger delay"
```

---

## Task 6: Обернуть About в RevealOnScroll

**Files:**
- Modify: `src/app/components/About.tsx`

- [ ] **Step 1: Заменить содержимое About.tsx**

```tsx
import { RevealOnScroll } from "./animations/RevealOnScroll";

export default function About() {
  return (
    <section id="about" className="section-alt py-20 px-6">
      <div className="max-w-4xl mx-auto">
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
    </section>
  );
}
```

- [ ] **Step 2: Smoke test в dev server**

```bash
npm run dev
```

Открыть `http://localhost:3000/portfolio/`, проскроллить до About. Visually verify: при появлении секции в viewport заголовок + карточка fade+slide-up. Заголовок «glitch'ит» 200ms (RGB-shift через text-shadow).

Закрыть dev server (Ctrl+C).

- [ ] **Step 3: Build + Commit**

```bash
npm run build
git add src/app/components/About.tsx
git commit -m "Apply scroll reveal + glitch to About section"
```

---

## Task 7: Обернуть Skills с staggered reveal + floating иконки

**Files:**
- Modify: `src/app/components/Skills.tsx`

- [ ] **Step 1: Заменить содержимое Skills.tsx**

```tsx
import { RevealOnScroll } from "./animations/RevealOnScroll";

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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {skills.map((skill, i) => (
            <RevealOnScroll key={skill.name} delayMs={i * 50}>
              <div className="pixel-card p-4 flex flex-col items-center gap-3 text-center">
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
          ))}
        </div>
      </div>
    </section>
  );
}
```

Что изменилось:
- Каждая skill-карточка обёрнута в `RevealOnScroll` с staggered `delayMs={i * 50}`
- Контейнер цветной иконки получил класс `float` + рандомизированный `animationDelay` через `(i % 5) * 0.2s` (5 уникальных фаз чтобы не синхронизировались)

- [ ] **Step 2: Smoke test**

```bash
npm run dev
```

Проскроллить до Skills, проверить:
- 12 карточек появляются волной (50ms между ними)
- Иконки внутри постоянно «парят» (±3px Y, разные фазы)
- Заголовок glitch'ит при появлении

- [ ] **Step 3: Build + Commit**

```bash
npm run build
git add src/app/components/Skills.tsx
git commit -m "Apply staggered scroll reveal and floating icons to Skills"
```

---

## Task 8: Обернуть Projects с staggered reveal

**Files:**
- Modify: `src/app/components/Projects.tsx` (только обёртки + className на навигационных кнопках карусели)

- [ ] **Step 1: Открыть существующий Projects.tsx**

Текущий файл содержит `"use client"` директиву и `ProjectCard` компонент. Нам нужно:
1. Импортировать `RevealOnScroll` (он client — это OK, мы и так в client component'е).
2. Обернуть section title и каждую карточку.
3. Добавить hover-scale на кнопки карусели через CSS-класс.

- [ ] **Step 2: Заменить содержимое Projects.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { BASE_PATH } from "../config";
import { RevealOnScroll } from "./animations/RevealOnScroll";

const projects = [
  {
    title: "VocabMaster",
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

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    project.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [project.images]);

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
        style={{
          fontFamily: "var(--pixel-font)",
          fontSize: "10px",
          lineHeight: "2",
        }}
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
      >
        GitHub
      </a>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section-light py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            Проекты
          </h2>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <RevealOnScroll key={project.title} delayMs={i * 100}>
              <ProjectCard project={project} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Что изменилось:
- Импорт `RevealOnScroll`.
- Section title и каждая карточка обёрнуты (delay 100ms между карточками).
- Кнопкам карусели добавлены классы `carousel-nav-btn` и `carousel-dot-btn` — стилизуем их CSS'ом в следующем шаге.

- [ ] **Step 3: Добавить hover-стили для кнопок карусели в globals.css**

В конец `src/app/globals.css` добавить (перед `@media (prefers-reduced-motion: reduce)` блоком):

```css
.carousel-nav-btn,
.carousel-dot-btn {
  transition: transform 100ms ease-out, box-shadow 100ms ease-out;
}

.carousel-nav-btn:hover,
.carousel-dot-btn:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 2px 2px 0 0 var(--foreground);
}

.carousel-dot-btn:hover {
  transform: scale(1.3);
}
```

Затем расширить блок reduced-motion (внутри существующего `@media`) — добавить:

```css
  .carousel-nav-btn:hover,
  .carousel-dot-btn:hover { transform: none; box-shadow: none; }
```

Финальный блок reduced-motion должен выглядеть так:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll,
  .reveal-on-scroll.is-visible {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .reveal-on-scroll.is-visible .section-title { animation: none; }
  .pixel-card:hover { transform: none; }
  .pixel-btn:active, .pixel-btn-outline:active { animation: none; }
  .float, .blink { animation: none !important; }
  .carousel-nav-btn:hover,
  .carousel-dot-btn:hover { transform: none; box-shadow: none; }
}
```

**Замечание про trance translate:** `.carousel-nav-btn` уже имеет inline-стиль `top-1/2 -translate-y-1/2` (Tailwind utility). Hover transform `translateY(-50%) scale(1.1)` сохраняет позиционирование + добавляет масштаб. Точечки (dots) не имеют translate, поэтому только `scale(1.3)`.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

Проверить:
- Карточки проектов появляются друг за другом (100ms stagger)
- При hover на стрелку `<` или `>` — она увеличивается на 10%
- При hover на точечку — она увеличивается на 30%
- Hover на саму карточку проекта — она поднимается с лёгким наклоном (-0.5deg) — это работает за счёт обновлённого `.pixel-card:hover` из Task 2

- [ ] **Step 5: Build + Commit**

```bash
npm run build
git add src/app/components/Projects.tsx src/app/globals.css
git commit -m "Apply staggered scroll reveal and hover scale to Projects carousel"
```

---

## Task 9: Обернуть Contacts в RevealOnScroll

**Files:**
- Modify: `src/app/components/Contacts.tsx`

Текущий Contacts.tsx — server component с тремя контактными ссылками (email, VK, GitHub) внутри `pixel-card`. Никакой формы пока нет (форма + boss fight интегрируются в Plan C).

- [ ] **Step 1: Заменить содержимое Contacts.tsx**

```tsx
import { RevealOnScroll } from "./animations/RevealOnScroll";

export default function Contacts() {
  return (
    <section id="contacts" className="section-alt py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            Контакты
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delayMs={150}>
          <div className="pixel-card p-8 md:p-12 max-w-lg mx-auto">
            <div className="flex flex-col gap-8">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 bg-accent border-3 border-foreground flex items-center justify-center shrink-0"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "14px", color: "#fff" }}
                >
                  @
                </div>
                <div>
                  <p
                    className="text-foreground mb-2"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
                  >
                    Email
                  </p>
                  <a
                    href="mailto:agababanz07@gmail.com"
                    className="text-accent hover:underline"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "11px" }}
                  >
                    agababanz07@gmail.com
                  </a>
                </div>
              </div>

              {/* VK */}
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 bg-accent border-3 border-foreground flex items-center justify-center shrink-0"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "10px", color: "#fff" }}
                >
                  VK
                </div>
                <div>
                  <p
                    className="text-foreground mb-2"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
                  >
                    VKонтакте
                  </p>
                  <a
                    href="https://vk.com/id747971085"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "11px" }}
                  >
                    Jas Aga
                  </a>
                </div>
              </div>

              {/* GitHub */}
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 bg-accent border-3 border-foreground flex items-center justify-center shrink-0"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "10px", color: "#fff" }}
                >
                  GH
                </div>
                <div>
                  <p
                    className="text-foreground mb-2"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
                  >
                    GitHub
                  </p>
                  <a
                    href="https://github.com/jas76123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "11px" }}
                  >
                    jas76123
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-1">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2"
                  style={{
                    background: i % 3 === 0 ? "var(--accent)" : i % 3 === 1 ? "var(--accent-light)" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
```

Что изменилось: импорт `RevealOnScroll`, обёртка section-title, обёртка `pixel-card` с `delayMs={150}`. Содержимое контактов не тронуто.

- [ ] **Step 2: Smoke test**

```bash
npm run dev
```

Проскроллить до самого низа сайта. Заголовок «Контакты» появляется fade+slide-up + glitch, через 150ms карточка контактов появляется тем же образом.

- [ ] **Step 3: Build + Commit**

```bash
npm run build
git add src/app/components/Contacts.tsx
git commit -m "Apply scroll reveal to Contacts section"
```

---

## Task 10: Создать хук useTypingEffect

**Files:**
- Create: `src/app/hooks/useTypingEffect.ts`

- [ ] **Step 1: Создать файл**

```ts
"use client";

import { useEffect, useState } from "react";

export function useTypingEffect(text: string, speedMs = 50, enabled = true): {
  shown: string;
  done: boolean;
} {
  const [shown, setShown] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      setDone(true);
      return;
    }
    setShown("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speedMs);
    return () => clearInterval(interval);
  }, [text, speedMs, enabled]);

  return { shown, done };
}
```

- [ ] **Step 2: Build + Commit**

```bash
npm run build
git add src/app/hooks/useTypingEffect.ts
git commit -m "Add useTypingEffect hook"
```

---

## Task 11: Создать компонент TypingText

**Files:**
- Create: `src/app/components/animations/TypingText.tsx`

- [ ] **Step 1: Создать файл**

```tsx
"use client";

import { useTypingEffect } from "../../hooks/useTypingEffect";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type Props = {
  children: string;
  speedMs?: number;
  showCursor?: boolean;
};

export function TypingText({ children, speedMs = 50, showCursor = true }: Props) {
  const reduced = usePrefersReducedMotion();
  const { shown } = useTypingEffect(children, speedMs, !reduced);

  return (
    <>
      {shown}
      {showCursor && (
        <span className="blink" aria-hidden="true">
          |
        </span>
      )}
    </>
  );
}
```

Замечание про SSR:
- Первый render (server + client первый раз): `shown = ""` (потому что `enabled = !reduced`, а `reduced` инициализируется `false`, значит `enabled = true`, и `shown = ""`).
- Это значит SSR-html содержит пустую строку.
- Для аксессибильности добавим `aria-label` на родительский h1 в Hero, чтобы скринридер прочитал полный текст независимо от анимации.

- [ ] **Step 2: Build + Commit**

```bash
npm run build
git add src/app/components/animations/TypingText.tsx
git commit -m "Add TypingText component with prefers-reduced-motion respect"
```

---

## Task 12: Применить TypingText к Hero h1

**Files:**
- Modify: `src/app/components/Hero.tsx`

- [ ] **Step 1: Импортировать TypingText**

В начало `Hero.tsx` добавить:
```tsx
import { TypingText } from "./animations/TypingText";
```

- [ ] **Step 2: Заменить h1 текст**

Найти блок:
```tsx
<h1
  className="text-2xl md:text-4xl text-center mb-4 text-foreground"
  style={{ fontFamily: "var(--pixel-font)", lineHeight: "1.6" }}
>
  Жасмин Агабабян
</h1>
```

Заменить на:
```tsx
<h1
  aria-label="Жасмин Агабабян"
  className="text-2xl md:text-4xl text-center mb-4 text-foreground"
  style={{ fontFamily: "var(--pixel-font)", lineHeight: "1.6" }}
>
  <TypingText>Жасмин Агабабян</TypingText>
</h1>
```

- [ ] **Step 3: Применить fade-in delay к подзаголовкам**

Найти `<p className="text-accent text-center mb-2 relative z-10" ...>Mobile &amp; Web Разработчик</p>` и `<p className="text-center mb-8 relative z-10" ...>Flutter / React / Python</p>`.

Имя «Жасмин Агабабян» — 15 символов × 50ms = 750ms typing. Подзаголовки fade-in после: первый на 800ms, второй на 1100ms.

Заменить первый подзаголовок:
```tsx
<p
  className="text-accent text-center mb-2 relative z-10"
  style={{
    fontFamily: "var(--pixel-font)",
    fontSize: "14px",
    animation: "fadeIn 500ms ease-out 800ms backwards",
  }}
>
  Mobile &amp; Web Разработчик
</p>
```

Заменить второй подзаголовок:
```tsx
<p
  className="text-center mb-8 relative z-10"
  style={{
    fontFamily: "var(--pixel-font)",
    fontSize: "10px",
    color: "var(--accent-light)",
    animation: "fadeIn 500ms ease-out 1100ms backwards",
  }}
>
  Flutter / React / Python
</p>
```

`backwards` в shorthand-пропе animation = `animation-fill-mode: backwards` — элементы сразу принимают начальное состояние keyframe (opacity: 0) до старта анимации, а не показываются на полную видимость до этого. Это критично — без `backwards` в первые 800ms подзаголовки были бы видны, потом резко исчезли и плавно появились бы снова.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

Открыть `http://localhost:3000/portfolio/`. На загрузке:
- Имя печатается посимвольно (~750ms)
- Курсор `|` мигает после имени
- Первый подзаголовок появляется fade-in примерно через 800ms (сразу после имени)
- Второй подзаголовок появляется fade-in через 1100ms (после первого)

- [ ] **Step 5: Build + Commit**

```bash
npm run build
git add src/app/components/Hero.tsx
git commit -m "Apply TypingText to Hero name with subtitle fade-in chain"
```

---

## Task 13: Создать компонент PixelSpawn

**Files:**
- Create: `src/app/components/animations/PixelSpawn.tsx`

- [ ] **Step 1: Создать файл**

```tsx
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  gridSize?: number;
  durationMs?: number;
};

export function PixelSpawn({ children, gridSize = 8, durationMs = 600 }: Props) {
  const total = gridSize * gridSize;
  const stepMs = durationMs / total;

  // Pre-compute reveal order: cells indexed by (row + col) diagonal, then by index.
  const cells = Array.from({ length: total }, (_, idx) => {
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    return { idx, key: row + col };
  });
  cells.sort((a, b) => a.key - b.key || a.idx - b.idx);
  const orderByIdx = new Map(cells.map((c, order) => [c.idx, order]));

  return (
    <div className="relative">
      {children}
      <div
        className="pixel-spawn-overlay absolute inset-0 grid pointer-events-none"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: total }).map((_, idx) => {
          const order = orderByIdx.get(idx) ?? 0;
          return (
            <div
              key={idx}
              style={{
                background: "var(--foreground)",
                opacity: 1,
                animation: `pixelFade ${stepMs}ms ${order * stepMs}ms forwards`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
```

Замечание: компонент НЕ помечен `"use client"` — он чисто статический (server-renderable). Анимация через CSS. SSR-friendly, no hydration mismatch.

- [ ] **Step 2: Добавить reduced-motion override для overlay**

Расширить блок `@media (prefers-reduced-motion: reduce)` в `globals.css`, добавив:

```css
  .pixel-spawn-overlay > * {
    animation: none !important;
    opacity: 0 !important;
  }
```

- [ ] **Step 3: Build + Commit**

```bash
npm run build
git add src/app/components/animations/PixelSpawn.tsx src/app/globals.css
git commit -m "Add PixelSpawn component with diagonal CSS reveal"
```

---

## Task 14: Применить PixelSpawn к Hero photo

**Files:**
- Modify: `src/app/components/Hero.tsx`

- [ ] **Step 1: Импортировать PixelSpawn**

```tsx
import { PixelSpawn } from "./animations/PixelSpawn";
```

- [ ] **Step 2: Обернуть `pixel-image` div в PixelSpawn**

Найти:
```tsx
<div className="float">
  <div className="pixel-image w-52 h-52 md:w-72 md:h-72 relative overflow-hidden">
    <img
      src={`${BASE_PATH}/images/photo.png`}
      alt="Жасмин Агабабян"
      className="w-full h-full object-cover"
    />
  </div>
</div>
```

Заменить на:
```tsx
<div className="float">
  <PixelSpawn gridSize={8} durationMs={600}>
    <div className="pixel-image w-52 h-52 md:w-72 md:h-72 relative overflow-hidden">
      <img
        src={`${BASE_PATH}/images/photo.png`}
        alt="Жасмин Агабабян"
        className="w-full h-full object-cover"
      />
    </div>
  </PixelSpawn>
</div>
```

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

На загрузке фото должно появляться через diagonal pixel-grid: 64 квадратика 8×8 проявляются за ~600ms.

- [ ] **Step 4: Build + Commit**

```bash
npm run build
git add src/app/components/Hero.tsx
git commit -m "Apply PixelSpawn to Hero photo"
```

---

## Task 15: Создать компонент MouseParallax

**Files:**
- Create: `src/app/components/animations/MouseParallax.tsx`

- [ ] **Step 1: Создать файл**

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type Props = {
  children: ReactNode;
  intensity?: number; // максимальный сдвиг в px
  className?: string;
};

export function MouseParallax({ children, intensity = 5, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;

    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;

    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      pendingX = ((e.clientX / w) - 0.5) * 2 * intensity;
      pendingY = ((e.clientY / h) - 0.5) * 2 * intensity;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          if (ref.current) {
            ref.current.style.transform = `translate(${pendingX.toFixed(2)}px, ${pendingY.toFixed(2)}px)`;
          }
          raf = 0;
        });
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [intensity, reduced]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Build + Commit**

```bash
npm run build
git add src/app/components/animations/MouseParallax.tsx
git commit -m "Add MouseParallax component"
```

---

## Task 16: Применить MouseParallax к Hero pixel-grid background

**Files:**
- Modify: `src/app/components/Hero.tsx`

- [ ] **Step 1: Импорт**

```tsx
import { MouseParallax } from "./animations/MouseParallax";
```

- [ ] **Step 2: Обернуть pixel-grid background**

Найти:
```tsx
<div className="absolute inset-0 opacity-10" style={{
  backgroundImage: `
    linear-gradient(var(--foreground) 1px, transparent 1px),
    linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
  `,
  backgroundSize: "32px 32px",
}} />
```

Заменить на:
```tsx
<MouseParallax intensity={5} className="absolute inset-0">
  <div className="absolute inset-0 opacity-10" style={{
    backgroundImage: `
      linear-gradient(var(--foreground) 1px, transparent 1px),
      linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
    `,
    backgroundSize: "32px 32px",
  }} />
</MouseParallax>
```

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

Двигать мышь по hero. Pixel-grid фон должен слегка смещаться (±5px) в направлении противоположном движению.

**Замечание:** intensity=5 даёт очень тонкий эффект. Если хочется заметнее — увеличить (но больше 10 уже навязчиво).

- [ ] **Step 4: Build + Commit**

```bash
npm run build
git add src/app/components/Hero.tsx
git commit -m "Apply MouseParallax to Hero background grid"
```

---

## Task 17: Создать компонент CursorTrail

**Files:**
- Create: `src/app/components/animations/CursorTrail.tsx`

- [ ] **Step 1: Создать файл**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type Particle = {
  x: number;
  y: number;
  bornAt: number;
  alive: boolean;
};

const POOL_SIZE = 16;
const PARTICLE_LIFE_MS = 400;
const SPAWN_INTERVAL_MS = 30; // ~33fps spawn rate

export function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    // Disable on touch-only devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    // Build pool of <div>'s
    const pool: { particle: Particle; el: HTMLDivElement }[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.width = "4px";
      el.style.height = "4px";
      el.style.background = "var(--accent)";
      el.style.pointerEvents = "none";
      el.style.opacity = "0";
      el.style.willChange = "transform, opacity";
      container.appendChild(el);
      pool.push({ particle: { x: 0, y: 0, bornAt: 0, alive: false }, el });
    }

    let mouseX = 0;
    let mouseY = 0;
    let lastSpawnAt = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const tick = (now: number) => {
      // Spawn new particle
      if (now - lastSpawnAt >= SPAWN_INTERVAL_MS) {
        const slot = pool.find((p) => !p.particle.alive);
        if (slot) {
          slot.particle.x = mouseX + (Math.random() - 0.5) * 8;
          slot.particle.y = mouseY + (Math.random() - 0.5) * 8;
          slot.particle.bornAt = now;
          slot.particle.alive = true;
        }
        lastSpawnAt = now;
      }

      // Update visuals
      for (const slot of pool) {
        const p = slot.particle;
        if (!p.alive) {
          slot.el.style.opacity = "0";
          continue;
        }
        const age = now - p.bornAt;
        if (age > PARTICLE_LIFE_MS) {
          p.alive = false;
          slot.el.style.opacity = "0";
          continue;
        }
        const t = age / PARTICLE_LIFE_MS;
        const opacity = 1 - t;
        slot.el.style.opacity = opacity.toFixed(2);
        slot.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      pool.forEach((p) => p.el.remove());
    };
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  );
}
```

Замечания:
- POOL_SIZE 16 — частиц одновременно живых ≤16. Никакого DOM-ростa.
- Disable на touch-устройствах (`pointer: fine` — только desktop с мышью).
- `prefers-reduced-motion: reduce` — компонент рендерит пустой div, без логики.

- [ ] **Step 2: Build + Commit**

```bash
npm run build
git add src/app/components/animations/CursorTrail.tsx
git commit -m "Add CursorTrail component (desktop only, particle pool)"
```

---

## Task 18: Замонтировать CursorTrail в layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Импортировать и замонтировать**

Заменить содержимое `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { CursorTrail } from "./components/animations/CursorTrail";

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
        {children}
        <CursorTrail />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Smoke test**

```bash
npm run dev
```

Двигать мышью по странице. За курсором должен лететь шлейф из 4×4px пиксельных частиц цвета `--accent`. Частицы fade-out за 400ms. На touch-only устройствах (мобильный) не появляются.

- [ ] **Step 3: Build + Commit**

```bash
npm run build
git add src/app/layout.tsx
git commit -m "Mount CursorTrail in root layout"
```

---

## Task 19: Финальный QA-прогон

**Files:**
- Read only: `docs/superpowers/specs/2026-04-28-portfolio-gamification-design.md` (секция 9)

- [ ] **Step 1: Запустить dev server**

```bash
cd /Users/jasminagababyan/portfolio
npm run dev
```

- [ ] **Step 2: QA checklist (визуальный, по секции 9 спеки)**

Открыть `http://localhost:3000/portfolio/` в Chrome. Пройтись по чек-листу:

- [ ] **Hero on load:**
  - [ ] Имя «Жасмин Агабабян» печатается посимвольно (~50ms/char)
  - [ ] Курсор-палка `|` мигает после имени
  - [ ] Подзаголовок «Mobile & Web Разработчик» появляется fade-in после имени (~800ms задержка)
  - [ ] Sub-subtitle «Flutter / React / Python» появляется fade-in после первого подзаголовка (~1100ms задержка)
  - [ ] Аватар появляется через diagonal pixel-grid (8×8 квадратиков, ~600ms)
  - [ ] При движении мыши pixel-grid background hero слегка смещается (±5px)
  - [ ] Существующая `.float` декорации продолжает работать (плавающие пиксели на hero)

- [ ] **Scroll-triggered:**
  - [ ] Каждая секция (About, Skills, Projects, Contacts) при появлении в viewport: fade + slide-up
  - [ ] Section-title (Обо мне / Навыки / Проекты / Контакты) glitch'ит при появлении
  - [ ] Skill-карточки появляются волной (50ms между ними)
  - [ ] Карточки проектов появляются волной (100ms между ними)

- [ ] **Hover/постоянные:**
  - [ ] Skill-иконки имеют floating motion (±3px Y, разные фазы)
  - [ ] Hover на карточке проекта поднимает её с лёгким наклоном (-0.5deg)
  - [ ] Hover на стрелке карусели `<` или `>` — scale 1.1
  - [ ] Hover на точечке-индикаторе карусели — scale 1.3
  - [ ] :active на любой `.pixel-btn` — лёгкий shake 100ms

- [ ] **Cursor trail:**
  - [ ] За курсором летит шлейф пиксельных частиц 4×4px
  - [ ] Частицы fade-out за 400ms
  - [ ] Не перекрывает существующий кастомный курсор

- [ ] **Step 3: Reduced-motion test**

В Chrome DevTools:
1. Открыть DevTools (F12)
2. Cmd+Shift+P (или Ctrl+Shift+P) → «Show Rendering»
3. Найти «Emulate CSS media feature prefers-reduced-motion» → выбрать `reduce`
4. Перезагрузить страницу

Проверить:
- [ ] Имя появляется сразу (без typing)
- [ ] Подзаголовки видны сразу (без fade-in задержки)
- [ ] Аватар не накрыт пиксельной сеткой (мгновенно виден)
- [ ] Никаких scroll-fade-анимаций (содержимое сразу видно)
- [ ] Никаких `.float` плавающих движений
- [ ] CursorTrail не работает (никаких частиц)
- [ ] Hover-эффекты на карточках/кнопках отключены
- [ ] Glitch на заголовках не запускается
- [ ] MouseParallax на hero background не работает

- [ ] **Step 4: Mobile test**

В DevTools переключить на mobile viewport (iPhone 12 Pro). Проверить:
- [ ] Все секции читабельны
- [ ] Карусель проектов работает (touch для свайпа стрелок и точек)
- [ ] CursorTrail НЕ появляется (нет mouse pointer)
- [ ] Hero typing/spawn работают

- [ ] **Step 5: Production build**

Закрыть dev server.

```bash
npm run build
```

Expected: build проходит зелёным, `out/` содержит обновлённые HTML/CSS/JS.

- [ ] **Step 6: Final commit (если нужно)**

Если в процессе QA нашлись правки — закоммитить.

```bash
git status
# если есть изменения:
git add <files>
git commit -m "Fix issues found in QA"
```

- [ ] **Step 7: Push и автодеплой**

```bash
git push origin main
```

GitHub Actions workflow `.github/workflows/deploy.yml` автоматически собирает и деплоит на GitHub Pages.

```bash
gh run watch --repo jas76123/portfolio
```

После завершения — открыть `https://jas76123.github.io/portfolio/` и проверить тот же чек-лист в проде.

---

## Self-review checklist (до старта реализации)

Заполнить после прочтения плана:

- [ ] Все pure-CSS keyframes (glitch, shake, pixelFade) определены в Task 2 до их использования
- [ ] Все хуки (`usePrefersReducedMotion`, `useScrollReveal`, `useTypingEffect`) созданы до компонентов которые их используют
- [ ] Все client-компоненты (`RevealOnScroll`, `TypingText`, `MouseParallax`, `CursorTrail`) помечены `"use client"`
- [ ] PixelSpawn — pure CSS, server-renderable, без `"use client"`
- [ ] `prefers-reduced-motion` обрабатывается на трёх уровнях: CSS (Task 2), хук `usePrefersReducedMotion` (Task 3), все JS-компоненты респектят его
- [ ] Существующие `.float` и `.blink` keyframes реюзаются, не дублируются
- [ ] Все смены — server-component-friendly где возможно (PixelSpawn, инстансы RevealOnScroll вокруг существующих server-components)
- [ ] Каждая секция (About, Skills, Projects, Contacts) имеет scroll-reveal — 4/4
- [ ] Финальный QA-чеклист (Task 19) покрывает все 5 пунктов спеки секции 9
