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
