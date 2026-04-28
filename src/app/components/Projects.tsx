"use client";

import { useState, useEffect } from "react";
import { BASE_PATH } from "../config";
import { RevealOnScroll } from "./animations/RevealOnScroll";
import { Coin } from "./game/Coin";
import { useAchievementTrigger } from "../hooks/useAchievementTrigger";
import { useGameState } from "../hooks/useGameState";
import type { AchievementId } from "./game/types";

const projects = [
  {
    title: "VocabMaster",
    achievementId: "app_reviewer" as AchievementId,
    description:
      "Мобильное приложение для изучения иностранных слов с флеш-карточками. Русско-английский и англо-русский словарь с возможностью добавления и запоминания слов.",
    tech: ["Flutter", "Dart", "SQLite"],
    github: "https://github.com/jas76123/vocabmaster",
    images: [
      `${BASE_PATH}/images/projects/vocabmaster/1.png`,
      `${BASE_PATH}/images/projects/vocabmaster/2.png`,
    ],
  },
  {
    title: "Hello Kitty Store",
    achievementId: "storefront_auditor" as AchievementId,
    description:
      "Интернет-магазин товаров Hello Kitty с каталогом, фильтрацией по категориям и ценам, корзиной покупок, страницами About и Contact.",
    tech: ["React", "JavaScript", "CSS"],
    github: "https://github.com/jas76123/HK",
    images: [
      `${BASE_PATH}/images/projects/hk/1.png`,
      `${BASE_PATH}/images/projects/hk/2.png`,
      `${BASE_PATH}/images/projects/hk/3.png`,
      `${BASE_PATH}/images/projects/hk/4.png`,
      `${BASE_PATH}/images/projects/hk/5.png`,
    ],
  },
];

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const { state, unlockAchievement } = useGameState();

  useEffect(() => {
    setSeen((prev) => {
      if (prev.has(currentImg)) return prev;
      const next = new Set(prev);
      next.add(currentImg);
      return next;
    });
  }, [currentImg]);

  useAchievementTrigger(
    project.achievementId,
    seen.size >= project.images.length
  );

  useEffect(() => {
    project.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [project.images]);

  const onGitHubClick = () => {
    if (state.gameMode && !state.achievements.includes("code_inspector")) {
      unlockAchievement("code_inspector");
    }
  };

  return (
    <div className="pixel-card p-6">
      <div className="relative w-full aspect-video mb-6 border-4 border-foreground overflow-hidden bg-gray-100">
        {project.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${project.title} скриншот ${i + 1}`}
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: i === currentImg ? 1 : 0 }}
          />
        ))}

        {project.title === "Hello Kitty Store" && currentImg === 2 && (
          <Coin id="coin_carousel" className="bottom-4 right-4" />
        )}

        {project.images.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentImg((prev) =>
                  prev === 0 ? project.images.length - 1 : prev - 1
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border-3 border-foreground px-2 py-1 carousel-nav-btn"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
            >
              {"<"}
            </button>
            <button
              onClick={() =>
                setCurrentImg((prev) =>
                  prev === project.images.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-3 border-foreground px-2 py-1 carousel-nav-btn"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
            >
              {">"}
            </button>
          </>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {project.images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className="w-3 h-3 border-2 border-foreground carousel-dot-btn"
            style={{
              background: i === currentImg ? "var(--accent)" : "transparent",
            }}
          />
        ))}
      </div>

      <h3
        className="text-foreground mb-3"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "16px" }}
      >
        {project.title}
      </h3>

      <p
        className="text-foreground mb-4"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "10px", lineHeight: "2" }}
      >
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {project.tech.map((t) => (
          <span key={t} className="skill-tag">
            {t}
          </span>
        ))}
      </div>

      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="pixel-btn inline-block"
        onClick={onGitHubClick}
      >
        GitHub
      </a>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section-light py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            Проекты
          </h2>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <RevealOnScroll key={project.title} delayMs={i * 100}>
              <ProjectCard project={project} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
