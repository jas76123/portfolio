const skills = [
  { name: "Kotlin", color: "#7F52FF" },
  { name: "Flutter", color: "#02569B" },
  { name: "Dart", color: "#0175C2" },
  { name: "Python", color: "#3776AB" },
  { name: "JavaScript", color: "#F7DF1E" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#000000" },
  { name: "SQL", color: "#336791" },
  { name: "HTML/CSS", color: "#E34F26" },
  { name: "Tailwind CSS", color: "#06B6D4" },
  { name: "Git", color: "#F05032" },
];

export default function Skills() {
  return (
    <section id="skills" className="section-light py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
          Навыки
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="pixel-card p-4 flex flex-col items-center gap-3 text-center"
            >
              <div
                className="w-10 h-10 border-3 border-foreground"
                style={{ background: skill.color }}
              />
              <span
                className="text-foreground"
                style={{ fontFamily: "var(--pixel-font)", fontSize: "9px" }}
              >
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
