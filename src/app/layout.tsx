import type { Metadata } from "next";
import "./globals.css";
import { CursorTrail } from "./components/animations/CursorTrail";

export const metadata: Metadata = {
  title: "Жасмин Агабабян — Портфолио",
  description: "Портфолио менеджера проектов Жасмин Агабабян: хакатоны, проекты, навыки и контакты.",
  keywords: ["портфолио", "менеджер проектов", "project manager", "хакатон", "MVP", "требования"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <CursorTrail />
      </body>
    </html>
  );
}
