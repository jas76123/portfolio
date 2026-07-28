"use client";

import { useState, useEffect, useRef } from "react";
import { BASE_PATH } from "../config";
import { RevealOnScroll } from "./animations/RevealOnScroll";

const projects = [
  {
    title: "Чистый город",
    description:
      "Гражданское приложение для жалоб на состояние города: жители отправляют обращения с фото и геометкой, следят за статусом на карте и в ленте, а сотрудники обрабатывают жалобы через веб-панель администратора. Дипломный проект с мобильным клиентом и бэкендом.",
    tech: ["Kotlin Multiplatform", "Compose", "Ktor", "Docker"],
    github: "https://github.com/jas76123/clean-city",
    images: [
      // Мобильный клиент
      `${BASE_PATH}/images/projects/cleancity/01.jpg`,
      `${BASE_PATH}/images/projects/cleancity/02.jpg`,
      `${BASE_PATH}/images/projects/cleancity/03.jpg`,
      `${BASE_PATH}/images/projects/cleancity/04.jpg`,
      `${BASE_PATH}/images/projects/cleancity/05.jpg`,
      `${BASE_PATH}/images/projects/cleancity/06.jpg`,
      `${BASE_PATH}/images/projects/cleancity/07.jpg`,
      `${BASE_PATH}/images/projects/cleancity/08.jpg`,
      // Веб-панель администратора
      `${BASE_PATH}/images/projects/cleancity/09.jpg`,
      `${BASE_PATH}/images/projects/cleancity/10.jpg`,
      `${BASE_PATH}/images/projects/cleancity/11.jpg`,
      `${BASE_PATH}/images/projects/cleancity/12.jpg`,
      `${BASE_PATH}/images/projects/cleancity/13.jpg`,
      `${BASE_PATH}/images/projects/cleancity/14.jpg`,
      `${BASE_PATH}/images/projects/cleancity/15.jpg`,
    ],
  },
  {
    title: "VocabMaster",
    description:
      "Мобильное приложение для изучения иностранных слов с флеш-карточками. Русско-английский и англо-русский словарь с возможностью добавления и запоминания слов.",
    tech: ["Kotlin", "Jetpack Compose", "Room"],
    github: "https://github.com/jas76123/vocabmaster",
    images: [
      `${BASE_PATH}/images/projects/vocabmaster/1.png`,
      `${BASE_PATH}/images/projects/vocabmaster/2.png`,
    ],
  },
];

// Максимальная высота окна со скриншотом: вертикальный скрин телефона
// не должен растягивать карточку на всю страницу.
const MAX_MEDIA_HEIGHT = 460;
const FALLBACK_RATIO = 16 / 9;

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [slotWidth, setSlotWidth] = useState(0);
  const [animated, setAnimated] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    project.images.forEach((src) => {
      const img = new Image();
      img.onload = () =>
        setRatios((prev) =>
          prev[src] ? prev : { ...prev, [src]: img.naturalWidth / img.naturalHeight }
        );
      img.src = src;
    });
  }, [project.images]);

  // Ширина, доступную под скриншот, меряем у обёртки: рамка внутри неё
  // задаётся в пикселях, поэтому обратной связи по размеру не возникает.
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    const measure = () => setSlotWidth(slot.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  // Первую подгонку размера делаем без анимации, иначе рамка «выезжает»
  // при появлении секции.
  useEffect(() => {
    if (!slotWidth) return;
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, [slotWidth]);

  const ratio = ratios[project.images[currentImg]] ?? FALLBACK_RATIO;
  const height = slotWidth ? Math.min(MAX_MEDIA_HEIGHT, slotWidth / ratio) : 0;

  // Ширина и высота задаются в пикселях, поэтому меняются одной анимацией
  // с той же кривой и длительностью, что и кроссфейд картинок.
  const frameSize = slotWidth
    ? { width: `${height * ratio}px`, height: `${height}px` }
    : { width: "100%", aspectRatio: String(ratio) };

  return (
    <div className="pixel-card p-6">
      <div ref={slotRef} className="relative w-full mb-6">
        <div
          className={`relative mx-auto overflow-hidden ${
            animated ? "project-media" : ""
          }`}
          style={frameSize}
        >
          {project.images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${project.title} скриншот ${i + 1}`}
              className="project-media-img absolute inset-0 w-full h-full object-contain"
              style={{ opacity: i === currentImg ? 1 : 0 }}
            />
          ))}
        </div>

        {project.images.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentImg((prev) =>
                  prev === 0 ? project.images.length - 1 : prev - 1
                )
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border-2 border-foreground px-2 py-1 carousel-nav-btn"
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
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border-2 border-foreground px-2 py-1 carousel-nav-btn"
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
        style={{
          fontFamily: "var(--pixel-font)",
          fontSize: "10px",
          lineHeight: "2",
        }}
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
