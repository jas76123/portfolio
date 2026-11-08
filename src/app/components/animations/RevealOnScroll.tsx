"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

type Props = {
  children: ReactNode;
  threshold?: number;
  delayMs?: number;
  className?: string;
  /** fade — плавный подъём, wipe — пиксельная «шторка», pop — выпрыгивание. */
  variant?: "fade" | "wipe" | "pop";
};

export function RevealOnScroll({
  children,
  threshold = 0.2,
  delayMs = 0,
  className = "",
  variant = "fade",
}: Props) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>(threshold);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll reveal-${variant} ${isVisible ? "is-visible" : ""} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms`, animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
