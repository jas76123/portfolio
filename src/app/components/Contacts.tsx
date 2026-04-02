export default function Contacts() {
  return (
    <section id="contacts" className="section-alt py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="section-title text-foreground mb-12 text-center mx-auto block w-fit">
          Контакты
        </h2>

        <div className="pixel-card p-8 md:p-12 max-w-lg mx-auto">
          <div className="flex flex-col gap-8">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 bg-accent border-3 border-foreground flex items-center justify-center shrink-0"
                style={{ fontFamily: "var(--pixel-font)", fontSize: "14px", color: "#fff" }}
              >
                @
              </div>
              <div>
                <p
                  className="text-foreground mb-2"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
                >
                  Email
                </p>
                <a
                  href="mailto:agababanz07@gmail.com"
                  className="text-accent hover:underline"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "11px" }}
                >
                  agababanz07@gmail.com
                </a>
              </div>
            </div>

            {/* VK */}
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 bg-accent border-3 border-foreground flex items-center justify-center shrink-0"
                style={{ fontFamily: "var(--pixel-font)", fontSize: "10px", color: "#fff" }}
              >
                VK
              </div>
              <div>
                <p
                  className="text-foreground mb-2"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
                >
                  VKонтакте
                </p>
                <a
                  href="https://vk.com/id747971085"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "11px" }}
                >
                  Jas Aga
                </a>
              </div>
            </div>

            {/* GitHub */}
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 bg-accent border-3 border-foreground flex items-center justify-center shrink-0"
                style={{ fontFamily: "var(--pixel-font)", fontSize: "10px", color: "#fff" }}
              >
                GH
              </div>
              <div>
                <p
                  className="text-foreground mb-2"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
                >
                  GitHub
                </p>
                <a
                  href="https://github.com/jas76123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                  style={{ fontFamily: "var(--pixel-font)", fontSize: "11px" }}
                >
                  jas76123
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-1">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2"
                style={{
                  background: i % 3 === 0 ? "var(--accent)" : i % 3 === 1 ? "var(--accent-light)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
