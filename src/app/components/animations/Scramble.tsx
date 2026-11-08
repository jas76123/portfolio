"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const GLYPHS = "█▓▒░<>/\\[]{}#$%&*+=?АБВГДЖЗИКЛМНПРСТФХЦЧШЭЮЯ01";

// Перебор случайных символов, пока буквы по очереди не «встанут на место».
function scrambleTo(
  target: string,
  setText: (s: string) => void,
  durationMs: number
): () => void {
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / durationMs);
    const settled = Math.floor(progress * target.length);
    let out = "";
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      if (i < settled || ch === " ") out += ch;
      else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
    setText(out);
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/** Заголовок, который «расшифровывается» при появлении на экране. */
export function ScrambleOnView({ text, durationMs = 700 }: { text: string; durationMs?: number }) {
  const [ref, visible] = useScrollReveal<HTMLSpanElement>(0.4);
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(text);
  const played = useRef(false);

  useEffect(() => {
    if (!visible || reduced || played.current) return;
    played.current = true;
    return scrambleTo(text, setShown, durationMs);
  }, [visible, reduced, text, durationMs]);

  return (
    <span ref={ref} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

/** Строка, которая по кругу меняет слова с эффектом перебора символов. */
export function ScrambleCycle({ words, holdMs = 2200 }: { words: string[]; holdMs?: number }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(words[0]);

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % words.length), holdMs);
    return () => window.clearTimeout(id);
  }, [index, reduced, holdMs, words.length]);

  useEffect(() => {
    if (reduced) return;
    return scrambleTo(words[index], setShown, 600);
  }, [index, reduced, words]);

  return (
    <span aria-label={words.join(", ")}>
      <span aria-hidden="true">{reduced ? words[0] : shown}</span>
    </span>
  );
}
