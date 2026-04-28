import { RevealOnScroll } from "./animations/RevealOnScroll";

const skills = [
  { name: "Kotlin", color: "#7F52FF", icon: "kotlin" },
  { name: "Flutter", color: "#02569B", icon: "flutter" },
  { name: "Dart", color: "#0175C2", icon: "dart" },
  { name: "Python", color: "#3776AB", icon: "python" },
  { name: "JavaScript", color: "#F7DF1E", icon: "javascript" },
  { name: "TypeScript", color: "#3178C6", icon: "typescript" },
  { name: "React", color: "#61DAFB", icon: "react" },
  { name: "Next.js", color: "#000000", icon: "nextdotjs" },
  { name: "SQL", color: "#336791", icon: "postgresql" },
  { name: "HTML/CSS", color: "#E34F26", icon: "html5" },
  { name: "Tailwind", color: "#06B6D4", icon: "tailwindcss" },
  { name: "Git", color: "#F05032", icon: "git" },
];

export default function Skills() {
  return (
    <section id="skills" className="section-light py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            Навыки
          </h2>
        </RevealOnScroll>

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
                  <img
                    src={`https://cdn.simpleicons.org/${skill.icon}/white`}
                    alt={skill.name}
                    className="w-8 h-8"
                    loading="lazy"
                  />
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
      </div>
    </section>
  );
}
