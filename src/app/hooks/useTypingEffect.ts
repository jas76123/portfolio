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
