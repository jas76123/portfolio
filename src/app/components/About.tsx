export default function About() {
  return (
    <section id="about" className="section-alt py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
          Обо мне
        </h2>

        <div className="pixel-card p-8 md:p-12">
          <p
            className="text-foreground leading-relaxed"
            style={{ fontFamily: "var(--pixel-font)", fontSize: "12px", lineHeight: "2.2" }}
          >
            Привет! Меня зовут Жасмин, я разработчик из г. Сочи.
            Создаю мобильные и веб-приложения, работаю с различными
            технологиями от мобильной разработки на Flutter и Kotlin
            до фронтенда на React и Next.js. Люблю решать интересные
            задачи и создавать полезные продукты.
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
      </div>
    </section>
  );
}
