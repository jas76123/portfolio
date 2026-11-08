"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

/** 3D-наклон карточки вслед за курсором и блик по поверхности. */
export function Tilt({
  children,
  max = 8,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !finePointer()) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
        el.style.setProperty("--gx", `${x * 100}%`);
        el.style.setProperty("--gy", `${y * 100}%`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max, reduced]);

  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

/** Кнопка, которая «притягивается» к курсору. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !finePointer()) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0, 0)";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, strength]);

  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}

/** Число, которое «набегает» при появлении на экране. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  durationMs = 1200,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}) {
  const [ref, visible] = useScrollReveal<HTMLSpanElement>(0.5);
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(to);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || reduced || started.current) return;
    started.current = true;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * to));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, reduced, to, durationMs]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/** Пиксельная полоса прогресса прокрутки — как шкала опыта в игре. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={ref} className="scroll-progress-bar" />
    </div>
  );
}

/** Загрузочный экран в стиле ретро-игры: один раз за сессию. */
export function BootScreen() {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<"show" | "leaving" | "done">("show");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("boot-seen") === "1";
      sessionStorage.setItem("boot-seen", "1");
    } catch {
      // без хранилища просто показываем заставку
    }
    if (seen || reduced) {
      setState("done");
      return;
    }
    const start = performance.now();
    const total = 1100;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      setProgress(Math.floor(p * 12));
      if (p < 1) frame = requestAnimationFrame(tick);
      else {
        setState("leaving");
        window.setTimeout(() => setState("done"), 450);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  if (state === "done") return null;

  return (
    <div className={`boot-screen ${state === "leaving" ? "is-leaving" : ""}`} aria-hidden="true">
      <p className="boot-title">PRESS START</p>
      <div className="boot-bar">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={i < progress ? "on" : ""} />
        ))}
      </div>
      <p className="boot-sub">загрузка портфолио…</p>
    </div>
  );
}

/** Бесконечная бегущая строка. */
export function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = (
    <div className="marquee-row">
      {items.map((item) => (
        <span key={item} className="marquee-item">
          {item}
          <span className="marquee-star" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${reverse ? "is-reverse" : ""}`} aria-label={items.join(", ")}>
      <div className="marquee-track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}
