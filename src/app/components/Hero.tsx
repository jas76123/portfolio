import { BASE_PATH } from "../config";

export default function Hero() {
  return (
    <section
      id="hero"
      className="section-hero min-h-screen flex flex-col items-center justify-center px-6 pt-20 relative overflow-hidden"
    >
      {/* Pixel grid background decoration */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--foreground) 1px, transparent 1px),
          linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }} />

      {/* Floating pixel decorations */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-accent float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-40 right-16 w-3 h-3 bg-accent-light float" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-32 left-20 w-5 h-5 bg-accent float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-60 right-32 w-2 h-2 bg-foreground float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-48 right-10 w-4 h-4 bg-accent-light float" style={{ animationDelay: "0.7s" }} />

      {/* Photo with pixel frame */}
      <div className="relative z-10 mb-8">
        {/* Corner decorations */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-accent" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-accent" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-accent" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-accent" />

        <div className="float">
          <div className="pixel-image w-52 h-52 md:w-72 md:h-72 relative overflow-hidden">
            <img
              src={`${BASE_PATH}/images/photo.png`}
              alt="Жасмин Агабабян"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Pixel stars around name */}
      <div className="relative z-10">
        <h1
          className="text-2xl md:text-4xl text-center mb-4 text-foreground"
          style={{ fontFamily: "var(--pixel-font)", lineHeight: "1.6" }}
        >
          Жасмин Агабабян
        </h1>
      </div>

      <p
        className="text-accent text-center mb-2 relative z-10"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "14px" }}
      >
        Mobile &amp; Web Разработчик
      </p>

      <p
        className="text-center mb-8 relative z-10"
        style={{ fontFamily: "var(--pixel-font)", fontSize: "10px", color: "var(--accent-light)" }}
      >
        Flutter / React / Python
      </p>

      <div className="flex gap-4 flex-wrap justify-center relative z-10">
        <a href="#projects" className="pixel-btn">
          Проекты
        </a>
        <a href="#contacts" className="pixel-btn-outline">
          Контакты
        </a>
      </div>

      {/* Pixel arrow down */}
      <div className="mt-12 relative z-10 flex flex-col items-center gap-1 float" style={{ animationDelay: "0.3s" }}>
        <div className="w-4 h-4 bg-accent" />
        <div className="flex gap-0">
          <div className="w-4 h-4" />
          <div className="w-4 h-4 bg-accent" />
          <div className="w-4 h-4" />
        </div>
      </div>
    </section>
  );
}
