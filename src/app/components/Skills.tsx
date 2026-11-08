import { RevealOnScroll } from "./animations/RevealOnScroll";
import { ScrambleOnView } from "./animations/Scramble";
import { Tilt } from "./animations/Motion";

// У аналитических навыков нет логотипов, поэтому вместо иконки — пиксельный символ.
// Инструменты с логотипом берут иконку из simpleicons.
const analysisSkills = [
  { name: "Сбор требований и ТЗ", color: "#6c63ff", symbol: "ТЗ" },
  { name: "User Stories и AC", color: "#a29bfe", symbol: "US" },
  { name: "Use Case и сценарии", color: "#6c63ff", symbol: "UC" },
  { name: "Статусы и переходы", color: "#a29bfe", symbol: "ST" },
  { name: "BPMN / UML", color: "#6c63ff", symbol: "UML" },
  { name: "REST API / OpenAPI", color: "#6BA539", icon: "openapiinitiative" },
  { name: "Модели данных / ER", color: "#a29bfe", symbol: "ER" },
  { name: "Критерии приёмки и тесты", color: "#6c63ff", symbol: "QA" },
];

const dataSkills = [
  { name: "SQL", color: "#336791", icon: "postgresql" },
  { name: "JOIN · GROUP BY · HAVING", color: "#6c63ff", symbol: "JN" },
  { name: "Подзапросы · CTE · CASE", color: "#a29bfe", symbol: "CTE" },
  { name: "Оконные функции", color: "#6c63ff", symbol: "WF" },
  { name: "Вероятность и статистика", color: "#a29bfe", symbol: "P(A)" },
  { name: "Excel / Sheets", color: "#34A853", icon: "googlesheets" },
];

const productSkills = [
  { name: "MVP и приоритеты", color: "#6c63ff", symbol: "MVP" },
  { name: "Backlog и Scrum", color: "#a29bfe", symbol: "BL" },
  { name: "Декомпозиция задач", color: "#6c63ff", symbol: "DC" },
  { name: "Jira", color: "#0052CC", icon: "jira" },
  { name: "Confluence", color: "#172B4D", icon: "confluence" },
  { name: "Linear", color: "#5E6AD2", icon: "linear" },
  { name: "Figma", color: "#F24E1E", icon: "figma" },
  { name: "Miro", color: "#050038", icon: "miro" },
];

const techSkills = [
  { name: "JavaScript", color: "#F7DF1E", icon: "javascript" },
  { name: "Python", color: "#3776AB", icon: "python" },
  { name: "Kotlin", color: "#7F52FF", icon: "kotlin" },
  { name: "Ktor", color: "#087CFA", icon: "ktor" },
  { name: "React", color: "#61DAFB", icon: "react" },
  { name: "Docker", color: "#2496ED", icon: "docker" },
  { name: "HTML/CSS", color: "#E34F26", icon: "html5" },
  { name: "Git", color: "#F05032", icon: "git" },
];

type Skill = { name: string; color: string; icon?: string; symbol?: string };

function SkillGrid({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {skills.map((skill, i) => (
        <RevealOnScroll key={skill.name} delayMs={i * 60} variant="pop">
          <Tilt max={14}>
            <div className="pixel-card p-4 flex flex-col items-center gap-3 text-center">
              <div
                className="w-14 h-14 flex items-center justify-center border-3 border-foreground rounded-none"
                style={{ background: skill.color }}
              >
                {skill.icon ? (
                  <img
                    src={`https://cdn.simpleicons.org/${skill.icon}/white`}
                    alt=""
                    className="w-8 h-8"
                    loading="lazy"
                  />
                ) : (
                  <span
                    className="text-white"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "11px" }}
                    aria-hidden="true"
                  >
                    {skill.symbol}
                  </span>
                )}
              </div>
              <span
                className="text-foreground"
                style={{ fontFamily: "var(--pixel-font)", fontSize: "9px", lineHeight: "1.6" }}
              >
                {skill.name}
              </span>
            </div>
          </Tilt>
        </RevealOnScroll>
      ))}
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-foreground mb-6 text-center"
      style={{ fontFamily: "var(--pixel-font)", fontSize: "12px" }}
    >
      {children}
    </h3>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="section-light py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            <ScrambleOnView text="Навыки" />
          </h2>
        </RevealOnScroll>

        <SubTitle>{"> Системный анализ"}</SubTitle>
        <SkillGrid skills={analysisSkills} />

        <div className="mt-14">
          <SubTitle>{"> SQL и данные"}</SubTitle>
          <SkillGrid skills={dataSkills} />
        </div>

        <div className="mt-14">
          <SubTitle>{"> Продукт и инструменты"}</SubTitle>
          <SkillGrid skills={productSkills} />
        </div>

        <div className="mt-14">
          <SubTitle>{"> Техническая база"}</SubTitle>
          <SkillGrid skills={techSkills} />
        </div>
      </div>
    </section>
  );
}
