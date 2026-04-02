import { BASE_PATH } from "../config";

export default function Hero() {
  return (
    <section
      id="hero"
      className="section-hero min-h-screen flex flex-col items-center justify-center px-6 pt-20"
    >
      <div className="float mb-8">
        <div className="pixel-image w-48 h-48 md:w-64 md:h-64 relative overflow-hidden">
          <img
            src={`${BASE_PATH}/images/photo.png`}
            alt="Жасмин Агабабян"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <h1
        className="text-2xl md:text-4xl text-center mb-4 text-foreground"
        style={{ fontFamily: "var(--pixel-font)", lineHeight: "1.6" }}
      >
        Жасмин Агабабян
      </h1>

      <p
        className="text-accent text-center mb-8"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "14px" }}
      >
        Разработчик
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <a href="#projects" className="pixel-btn">
          Проекты
        </a>
        <a href="#contacts" className="pixel-btn-outline">
          Контакты
        </a>
      </div>

      {/* Pixel decoration */}
      <div className="mt-16 flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-accent"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    </section>
  );
}
