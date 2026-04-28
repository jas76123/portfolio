"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type Particle = {
  x: number;
  y: number;
  bornAt: number;
  alive: boolean;
};

const POOL_SIZE = 16;
const PARTICLE_LIFE_MS = 400;
const SPAWN_INTERVAL_MS = 30;

export function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    const pool: { particle: Particle; el: HTMLDivElement }[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.width = "4px";
      el.style.height = "4px";
      el.style.background = "var(--accent)";
      el.style.pointerEvents = "none";
      el.style.opacity = "0";
      el.style.willChange = "transform, opacity";
      container.appendChild(el);
      pool.push({ particle: { x: 0, y: 0, bornAt: 0, alive: false }, el });
    }

    let mouseX = 0;
    let mouseY = 0;
    let lastSpawnAt = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const tick = (now: number) => {
      if (now - lastSpawnAt >= SPAWN_INTERVAL_MS) {
        const slot = pool.find((p) => !p.particle.alive);
        if (slot) {
          slot.particle.x = mouseX + (Math.random() - 0.5) * 8;
          slot.particle.y = mouseY + (Math.random() - 0.5) * 8;
          slot.particle.bornAt = now;
          slot.particle.alive = true;
        }
        lastSpawnAt = now;
      }

      for (const slot of pool) {
        const p = slot.particle;
        if (!p.alive) {
          slot.el.style.opacity = "0";
          continue;
        }
        const age = now - p.bornAt;
        if (age > PARTICLE_LIFE_MS) {
          p.alive = false;
          slot.el.style.opacity = "0";
          continue;
        }
        const t = age / PARTICLE_LIFE_MS;
        const opacity = 1 - t;
        slot.el.style.opacity = opacity.toFixed(2);
        slot.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      pool.forEach((p) => p.el.remove());
    };
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  );
}
