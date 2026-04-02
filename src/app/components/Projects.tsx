"use client";

import Image from "next/image";
import { useState } from "react";

const projects = [
  {
    title: "VocabMaster",
    description:
      "Мобильное приложение для изучения иностранных слов с флеш-карточками. Русско-английский и англо-русский словарь с возможностью добавления и запоминания слов.",
    tech: ["Flutter", "Dart", "SQLite"],
    github: "https://github.com/jas76123/vocabmaster",
    images: [
      "/images/projects/vocabmaster/1.png",
      "/images/projects/vocabmaster/2.png",
    ],
  },
  {
    title: "Hello Kitty Store",
    description:
      "Интернет-магазин товаров Hello Kitty с каталогом, фильтрацией по категориям и ценам, корзиной покупок, страницами About и Contact.",
    tech: ["React", "JavaScript", "CSS"],
    github: "https://github.com/jas76123/HK",
    images: [
      "/images/projects/hk/1.png",
      "/images/projects/hk/2.png",
      "/images/projects/hk/3.png",
      "/images/projects/hk/4.png",
      "/images/projects/hk/5.png",
    ],
  },
];

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const [currentImg, setCurrentImg] = useState(0);

  return (
    <div className="pixel-card p-6">
      {/* Image carousel */}
      <div className="relative w-full aspect-video mb-6 border-4 border-foreground overflow-hidden bg-gray-100">
        <Image
          src={project.images[currentImg]}
          alt={`${project.title} скриншот ${currentImg + 1}`}
          fill
          className="object-contain"
        />

        {project.images.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentImg((prev) =>
                  prev === 0 ? project.images.length - 1 : prev - 1
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border-3 border-foreground px-2 py-1"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-3 border-foreground px-2 py-1"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
            >
              {">"}
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-4">
        {project.images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className="w-3 h-3 border-2 border-foreground"
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
        style={{
          fontFamily: "var(--pixel-font)",
          fontSize: "10px",
          lineHeight: "2",
        }}
      >
        {project.description}
      </p>

      {/* Tech tags */}
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
      >
        GitHub
      </a>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
          Проекты
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
