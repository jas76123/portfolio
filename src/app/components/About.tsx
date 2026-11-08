import { RevealOnScroll } from "./animations/RevealOnScroll";
import { ScrambleOnView } from "./animations/Scramble";
import { Tilt } from "./animations/Motion";

const focus = [
  {
    symbol: "SA",
    title: "Системный анализ",
    text: "Выявляю требования, описываю роли, сценарии, статусы и переходы, проектирую API и модель данных, формулирую критерии приёмки.",
  },
  {
    symbol: "PM",
    title: "Продукт",
    text: "Определяю границы MVP и главный сценарий, расставляю приоритеты: что делаем сейчас, а что выносим за рамки релиза.",
  },
  {
    symbol: "PJ",
    title: "Проекты",
    text: "Веду backlog и сроки, синхронизирую аналитика, дизайнера и разработчиков, принимаю результат и довожу команду до сдачи.",
  },
];

export default function About() {
  return (
    <section id="about" className="section-alt py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
            <ScrambleOnView text="Обо мне" />
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delayMs={150} variant="wipe">
          <div className="pixel-card p-8 md:p-12">
            <div className="mono-text text-foreground space-y-4">
              <p>
                Я системный аналитик, продакт и проджект из Сочи. 11 месяцев
                работала в продуктовой команде B2B SaaS-платформы для автошкол: собирала требования,
                раскладывала их на задачи, писала user stories и критерии
                приёмки, вела backlog и проверяла изменения перед релизом.
              </p>
              <p>
                На хакатонах отвечала за продукт и команду: капитан на
                О!Хакатоне Островка, топ-10 «Лидеров цифровой трансформации».
                Прорабатывала роли, статусы и пользовательские сценарии — от
                границ MVP до сдачи в срок.
              </p>
              <p>
                Диплом с отличием по информационным системам и
                программированию: понимаю, как устроены клиент, сервер, API
                и база данных, пишу SQL и говорю с разработчиками на одном
                языке.
              </p>
            </div>

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

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {focus.map((item, i) => (
            <RevealOnScroll key={item.title} delayMs={200 + i * 120} variant="pop">
              <Tilt>
                <div className="pixel-card p-6">
                  <div
                    className="w-12 h-12 bg-accent border-3 border-foreground flex items-center justify-center text-white mb-5"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "11px" }}
                    aria-hidden="true"
                  >
                    {item.symbol}
                  </div>
                  <h3
                    className="text-foreground mb-3"
                    style={{ fontFamily: "var(--pixel-font)", fontSize: "12px", lineHeight: "1.6" }}
                  >
                    {item.title}
                  </h3>
                  <p className="mono-text text-foreground" style={{ fontSize: "13px", lineHeight: "1.65" }}>
                    {item.text}
                  </p>
                </div>
              </Tilt>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
