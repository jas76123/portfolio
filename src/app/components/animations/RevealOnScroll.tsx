"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

type Props = {
  children: ReactNode;
  threshold?: number;
  delayMs?: number;
  className?: string;
};

export function RevealOnScroll({
  children,
  threshold = 0.2,
  delayMs = 0,
  className = "",
}: Props) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>(threshold);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? "is-visible" : ""} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
