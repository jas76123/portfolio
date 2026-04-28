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
