import { RevealOnScroll } from "./animations/RevealOnScroll";

export default function About() {
  return (
    <section id="about" className="section-alt py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            Обо мне
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delayMs={150}>
          <div className="pixel-card p-8 md:p-12">
            <p
              className="text-foreground leading-relaxed"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "12px", lineHeight: "2.2" }}
            >
              Привет! Меня зовут Жасмин, я менеджер проектов из Сочи.
              Год работала в продуктовой команде B2B SaaS-платформы:
              собирала требования, писала сценарии и критерии приёмки, вела
              backlog и принимала изменения перед релизом. На хакатонах вела
              продукт от MVP до сдачи: капитан команды на О!Хакатоне Островка,
              топ-10 «Лидеров цифровой трансформации». Диплом с отличием
              по информационным системам и программированию помогает говорить
              с разработчиками на одном языке.
            </p>

            <div className="mt-8 flex gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2"
                  style={{
                    background: i % 2 === 0 ? "var(--accent)" : "var(--accent-light)",
                  }}
                />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
