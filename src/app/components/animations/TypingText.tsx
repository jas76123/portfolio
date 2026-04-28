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
