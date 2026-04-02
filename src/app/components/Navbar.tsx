"use client";

import { useState } from "react";

const links = [
  { href: "#hero", label: "Главная" },
  { href: "#about", label: "Обо мне" },
  { href: "#skills", label: "Навыки" },
  { href: "#projects", label: "Проекты" },
  { href: "#contacts", label: "Контакты" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="pixel-nav fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="#hero" className="text-accent text-sm font-bold" style={{ fontFamily: "var(--pixel-font)" }}>
          {"<JA/>"}
        </a>

        {/* Desktop */}
        <div className="hidden md:flex gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-foreground hover:text-accent transition-colors"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground text-xl"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
          style={{ fontFamily: "var(--pixel-font)", fontSize: "16px" }}
        >
          {open ? "X" : "="}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col gap-4 pb-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-foreground hover:text-accent transition-colors px-6"
              style={{ fontFamily: "var(--pixel-font)", fontSize: "10px" }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
