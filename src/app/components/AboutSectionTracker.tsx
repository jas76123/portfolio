"use client";

import type { ReactNode } from "react";
import { useViewportDwell } from "../hooks/useViewportDwell";
import { useAchievementTrigger } from "../hooks/useAchievementTrigger";

export function AboutSectionTracker({ children }: { children: ReactNode }) {
  const [ref, dwellMet] = useViewportDwell<HTMLDivElement>(3000, 0.2);
  useAchievementTrigger("background_check", dwellMet);

  return <div ref={ref}>{children}</div>;
}
