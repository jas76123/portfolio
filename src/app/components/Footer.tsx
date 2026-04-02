export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t-4 border-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <p
          className="text-foreground"
          style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
        >
          &copy; 2026 Жасмин Агабабян
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2"
              style={{
                background: i % 2 === 0 ? "var(--accent)" : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
