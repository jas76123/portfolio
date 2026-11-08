import { RevealOnScroll } from "./animations/RevealOnScroll";
import { ScrambleOnView } from "./animations/Scramble";
import ExperienceGallery from "./ExperienceGallery";

const duties = [
  "Собирала и уточняла требования внутренних заказчиков; описывала пользовательские сценарии и критерии приёмки (Acceptance Criteria)",
  "Оформляла задачи в Linear и сопровождала их в разработке: актуализировала постановки, статусы и договорённости, участвовала в приоритизации backlog",
  "Согласовывала уточнения с frontend- и backend-разработчиками; отслеживала зависимости и блокеры по задачам",
  "Участвовала в планировании итераций и командных синхронизациях",
  "Проводила функциональную приёмку по требованиям, оформляла баг-репорты и повторно проверяла исправления",
];

const modules = ["Расписание вождений", "Экзамены", "Медицинские справки", "Оплаты"];
const tools = ["Linear", "Figma", "Google Docs", "Google Sheets", "Excel"];
const stack = ["ASP.NET", "Next.js", "PostgreSQL", "REST API", "Kubernetes"];

function TagRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p
        className="text-foreground mb-3"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "9px", lineHeight: "1.6" }}
      >
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="exp-tag">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="section-light py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            <ScrambleOnView text="Опыт" />
          </h2>
        </RevealOnScroll>

        <RevealOnScroll variant="wipe" threshold={0.1}>
          <article className="pixel-card p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <span className="project-badge mb-4">Май 2025 — Март 2026 · 11 месяцев</span>
                <h3
                  className="text-foreground mt-4"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "15px", lineHeight: "1.6" }}
                >
                  Junior Project Manager / Project Coordinator
                </h3>
                <p className="mono-text text-foreground mt-2">
                  <a
                    href="https://autoschool.cloud/b2b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent font-bold hover:underline"
                  >
                    Приоритет Онлайн
                  </a>{" "}
                  — продуктовая IT-компания
                </p>
                <p className="mono-text text-foreground opacity-75" style={{ fontSize: "13px" }}>
                  B2B SaaS-платформа для автошкол autoschool.cloud · производственная практика
                  в продуктовой команде
                </p>
              </div>
              <div
                className="w-14 h-14 bg-accent border-3 border-foreground items-center justify-center text-white shrink-0 hidden md:flex"
                style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
                aria-hidden="true"
              >
                PM
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr_340px] gap-8 mb-8 items-start">
              <ul className="project-points">
                {duties.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <ExperienceGallery />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <TagRow title="> Модули" items={modules} />
              <TagRow title="> Инструменты" items={tools} />
              <TagRow title="> Стек продукта" items={stack} />
            </div>
          </article>
        </RevealOnScroll>
      </div>
    </section>
  );
}
