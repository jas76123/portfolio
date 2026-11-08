"use client";

import { useState, useEffect, useRef } from "react";
import { BASE_PATH } from "../config";
import { RevealOnScroll } from "./animations/RevealOnScroll";
import { ScrambleOnView } from "./animations/Scramble";

type Project = {
  title: string;
  badge?: string;
  description: string;
  role?: string;
  points?: string[];
  tech: string[];
  repo?: { url: string; label: string };
  images: string[];
};

const projects: Project[] = [
  {
    title: "Orbi",
    badge: "О!Хакатон 2026 · Островок",
    description:
      "Подбор отеля по тому, чего нет в карточке: виден ли закат, тихо ли ночью, сколько на самом деле идти до моря. Система считает характеристики по открытым геоданным, уточняет недостающее у отельера и ищет по запросу обычными словами. Демо на 150 отелях Сочи.",
    role: "Капитан команды, Product / Project Manager",
    points: [
      "Разобрала требования трека и правила сдачи, составила список блокеров и вопросов к организаторам",
      "Расставляла приоритеты финальной недели: что доводим до демо, что выносим за рамки MVP",
      "Тестировала сценарии и роли, вела список дефектов и перепроверяла исправления",
      "Довела команду из пяти человек до сдачи в срок",
    ],
    tech: ["Анализ требований", "MVP", "Приоритизация", "Функциональное тестирование", "Go", "React"],
    repo: { url: "https://github.com/jas76123/orbi", label: "GitHub" },
    images: [1, 2, 3, 4, 5, 6, 7].map(
      (n) => `${BASE_PATH}/images/projects/orbi/0${n}.jpg`
    ),
  },
  {
    title: "Объектив",
    badge: "Лидеры цифровой трансформации 2026 · Топ-10",
    description:
      "Контроль стройки: снимки с камер на площадке и фотоотчёты прорабов из мобильного приложения «Объектив» сверяются с календарным планом, нейросеть распознаёт технику. Руководитель видит план-факт, риски и календарь по всем объектам.",
    role: "Product Manager, анализ требований",
    points: [
      "Определила границы MVP и главный сценарий: сверка факта с календарным планом",
      "Проработала роли, статусы работ и путь фотоотчёта: отправка, проверка, возврат на доработку",
      "Согласовывала требования и макеты с аналитиком, дизайнером, ML- и бэкенд-разработчиками",
      "Вела задачи команды в Jira: декомпозиция, приоритеты, статусы и сроки",
      "Проводила дейлики и прогоны пользовательских сценариев перед сдачей",
    ],
    tech: ["Роли и статусы", "Пользовательские сценарии", "MVP", "Jira", "React Native", "Python"],
    repo: { url: "https://sourcecraft.dev/cd-rec/construction-monitoring?rev=main", label: "SourceCraft" },
    // Сначала мобильное приложение прораба, затем дашборд руководителя,
    // аналитика камер с площадки и импорт графика
    images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
      (n) => `${BASE_PATH}/images/projects/obyektiv/${String(n).padStart(2, "0")}.jpg`
    ),
  },
  {
    title: "Чистый город",
    badge: "Дипломный проект · с отличием",
    description:
      "Гражданское приложение для жалоб на состояние города: жители отправляют обращения с фото и геометкой, следят за статусом на карте и в ленте, а сотрудники обрабатывают жалобы через веб-панель администратора.",
    role: "Полный цикл: от анализа до демонстрации",
    points: [
      "Собрала требования и выделила роли: житель и сотрудник, обрабатывающий жалобы",
      "Описала жизненный цикл обращения: статусы и переходы, ответственные, контроль сроков (SLA)",
      "Спроектировала REST API на 38 эндпоинтов и описала его в OpenAPI, авторизация по JWT",
      "Обсуждала проект с администрацией Сочи",
      "Прошла путь от требований и проектирования до разработки, тестирования и защиты",
    ],
    tech: ["Требования", "OpenAPI", "REST", "JWT", "Kotlin Multiplatform", "Ktor", "Docker"],
    repo: { url: "https://github.com/jas76123/clean-city", label: "GitHub" },
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
    repo: { url: "https://github.com/jas76123/vocabmaster", label: "GitHub" },
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

function ProjectCard({ project }: { project: Project }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const [slotWidth, setSlotWidth] = useState(0);
  const [animated, setAnimated] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const requested = useRef<Set<string>>(new Set());

  // Грузим только текущий кадр и соседей: раньше карточка тянула все
  // скриншоты сразу и отбирала канал у фото на первом экране.
  useEffect(() => {
    const count = project.images.length;
    const neighbours = [currentImg, (currentImg + 1) % count, (currentImg - 1 + count) % count];

    setLoaded((prev) => {
      const next = new Set(prev);
      neighbours.forEach((i) => next.add(i));
      return next.size === prev.size ? prev : next;
    });

    neighbours.forEach((i) => {
      const src = project.images[i];
      if (requested.current.has(src)) return;
      requested.current.add(src);

      const img = new Image();
      img.onload = () =>
        setRatios((prev) =>
          prev[src] ? prev : { ...prev, [src]: img.naturalWidth / img.naturalHeight }
        );
      img.src = src;
    });
  }, [project.images, currentImg]);

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
    // На десктопе карточка горизонтальная: слева скриншоты, справа текст.
    // Так карточки идут по одной в ряд и не оставляют пустот под короткой соседкой.
    <div className="pixel-card p-6 flex flex-col md:flex-row gap-6 md:gap-8">
      <div className="md:w-1/2 md:shrink-0 md:self-center">
        <div ref={slotRef} className="relative w-full mb-6">
          <div
            className={`relative mx-auto overflow-hidden ${
              animated ? "project-media" : ""
            }`}
            style={frameSize}
          >
            {project.images.map((src, i) =>
              loaded.has(i) ? (
                <img
                  key={src}
                  src={src}
                  alt={`${project.title} скриншот ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="project-media-img absolute inset-0 w-full h-full object-contain"
                  style={{ opacity: i === currentImg ? 1 : 0 }}
                />
              ) : null
            )}
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

      </div>

      <div className="flex flex-col items-start md:flex-1 min-w-0">
        {project.badge && (
          <span className="project-badge mb-3">{project.badge}</span>
        )}

        <h3
          className="text-foreground mb-3"
          style={{ fontFamily: "var(--pixel-font)", fontSize: "16px" }}
        >
          {project.title}
        </h3>

        <p className="mono-text text-foreground mb-4">
          {project.description}
        </p>

        {project.role && (
          <p
            className="text-accent mb-2"
            style={{ fontFamily: "var(--pixel-font)", fontSize: "10px", lineHeight: "1.8" }}
          >
            Моя роль: {project.role}
          </p>
        )}

        {project.points && (
          <ul className="project-points mb-4">
            {project.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((t) => (
            <span key={t} className="skill-tag">
              {t}
            </span>
          ))}
        </div>

        {project.repo && (
          <a
            href={project.repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn inline-block"
          >
            {project.repo.label}
          </a>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section-light py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            <ScrambleOnView text="Проекты" />
          </h2>
        </RevealOnScroll>

        <div className="flex flex-col gap-10">
          {projects.map((project, i) => (
            <RevealOnScroll key={project.title} delayMs={i * 100} threshold={0.1} variant="wipe">
              <ProjectCard project={project} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
