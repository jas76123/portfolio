"use client";

import { useState } from "react";
import { BASE_PATH } from "../config";

const shots = [
  { file: "01.jpg", caption: "Вопрос экзамена с объяснением ответа" },
  { file: "02.jpg", caption: "Билеты и внутренний экзамен" },
  { file: "03.jpg", caption: "Билеты по темам" },
  { file: "04.jpg", caption: "Посещаемость лекций" },
  { file: "05.jpg", caption: "Результативность посещённых лекций" },
  { file: "06.jpg", caption: "Статистика по темам лекций" },
  { file: "07.jpg", caption: "3D-сцены для тренировки ситуаций на дороге" },
].map((s) => ({ ...s, src: `${BASE_PATH}/images/experience/autoschool/${s.file}` }));

export default function ExperienceGallery() {
  const [current, setCurrent] = useState(0);
  const count = shots.length;
  // Держим в DOM только текущий кадр и соседей, остальные не грузим.
  const near = new Set([current, (current + 1) % count, (current - 1 + count) % count]);

  const go = (delta: number) => setCurrent((c) => (c + delta + count) % count);

  return (
    <div>
      <div className="relative">
        <div className="relative w-full aspect-square bg-white overflow-hidden">
          {shots.map((shot, i) =>
            near.has(i) ? (
              <img
                key={shot.src}
                src={shot.src}
                alt={shot.caption}
                loading="lazy"
                decoding="async"
                className="project-media-img absolute inset-0 w-full h-full object-contain"
                style={{ opacity: i === current ? 1 : 0 }}
              />
            ) : null
          )}
        </div>

        <button
          onClick={() => go(-1)}
          aria-label="Предыдущий скриншот"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border-2 border-foreground px-2 py-1 carousel-nav-btn"
          style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
        >
          {"<"}
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Следующий скриншот"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border-2 border-foreground px-2 py-1 carousel-nav-btn"
          style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
        >
          {">"}
        </button>
      </div>

      <p className="mono-text text-foreground text-center mt-3" style={{ fontSize: "12px", lineHeight: "1.5" }}>
        {shots[current].caption}
      </p>

      <div className="flex justify-center gap-2 mt-3">
        {shots.map((shot, i) => (
          <button
            key={shot.src}
            onClick={() => setCurrent(i)}
            aria-label={`Скриншот ${i + 1}`}
            className="w-3 h-3 border-2 border-foreground carousel-dot-btn"
            style={{ background: i === current ? "var(--accent)" : "transparent" }}
          />
        ))}
      </div>
    </div>
  );
}
