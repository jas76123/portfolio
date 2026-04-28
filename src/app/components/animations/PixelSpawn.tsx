import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  gridSize?: number;
  durationMs?: number;
};

export function PixelSpawn({ children, gridSize = 8, durationMs = 600 }: Props) {
  const total = gridSize * gridSize;
  const stepMs = durationMs / total;

  // Pre-compute reveal order: cells indexed by (row + col) diagonal, then by index.
  const cells = Array.from({ length: total }, (_, idx) => {
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    return { idx, key: row + col };
  });
  cells.sort((a, b) => a.key - b.key || a.idx - b.idx);
  const orderByIdx = new Map(cells.map((c, order) => [c.idx, order]));

  return (
    <div className="relative">
      {children}
      <div
        className="pixel-spawn-overlay absolute inset-0 grid pointer-events-none"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: total }).map((_, idx) => {
          const order = orderByIdx.get(idx) ?? 0;
          return (
            <div
              key={idx}
              style={{
                background: "var(--foreground)",
                opacity: 1,
                animation: `pixelFade ${stepMs}ms ${order * stepMs}ms forwards`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
