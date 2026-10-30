import { RevealOnScroll } from "./animations/RevealOnScroll";

// У навыков управления нет логотипов, поэтому вместо иконки — пиксельный символ.
// Инструменты с логотипом берут иконку из simpleicons, как технологии ниже.
const pmSkills = [
  { name: "Требования и ТЗ", color: "#6c63ff", symbol: "ТЗ" },
  { name: "Backlog и Scrum", color: "#a29bfe", symbol: "BL" },
  { name: "MVP и приоритеты", color: "#6c63ff", symbol: "MVP" },
  { name: "Приёмка и тесты", color: "#a29bfe", symbol: "QA" },
  { name: "Jira", color: "#0052CC", icon: "jira" },
  { name: "Linear", color: "#5E6AD2", icon: "linear" },
  { name: "Figma", color: "#F24E1E", icon: "figma" },
  { name: "Excel / Sheets", color: "#34A853", icon: "googlesheets" },
];

const techSkills = [
  { name: "Kotlin", color: "#7F52FF", icon: "kotlin" },
  { name: "Ktor", color: "#087CFA", icon: "ktor" },
  { name: "Docker", color: "#2496ED", icon: "docker" },
  { name: "Python", color: "#3776AB", icon: "python" },
  { name: "JavaScript", color: "#F7DF1E", icon: "javascript" },
  { name: "TypeScript", color: "#3178C6", icon: "typescript" },
  { name: "React", color: "#61DAFB", icon: "react" },
  { name: "Next.js", color: "#000000", icon: "nextdotjs" },
  { name: "SQL", color: "#336791", icon: "postgresql" },
  { name: "HTML/CSS", color: "#E34F26", icon: "html5" },
  { name: "Git", color: "#F05032", icon: "git" },
];

type Skill = { name: string; color: string; icon?: string; symbol?: string };

function SkillGrid({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {skills.map((skill, i) => (
        <RevealOnScroll key={skill.name} delayMs={i * 50}>
          <div className="pixel-card p-4 flex flex-col items-center gap-3 text-center">
            <div
              className="w-14 h-14 flex items-center justify-center border-3 border-foreground rounded-none"
              style={{
                background: skill.color,
              }}
            >
              {skill.icon ? (
                <img
                  src={`https://cdn.simpleicons.org/${skill.icon}/white`}
                  alt={skill.name}
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
              style={{ fontFamily: "var(--pixel-font)", fontSize: "9px" }}
            >
              {skill.name}
            </span>
          </div>
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
    <section id="skills" className="section-light py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            Навыки
          </h2>
        </RevealOnScroll>

        <SubTitle>Управление проектами</SubTitle>
        <SkillGrid skills={pmSkills} />

        <div className="mt-14">
          <SubTitle>Техническая база</SubTitle>
          <SkillGrid skills={techSkills} />
        </div>
      </div>
    </section>
  );
}
