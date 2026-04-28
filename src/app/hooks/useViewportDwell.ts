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
