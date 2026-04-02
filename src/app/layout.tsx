import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Жасмин Агабабян — Портфолио",
  description: "Персональное портфолио разработчика Жасмин Агабабян. Проекты, навыки и контакты.",
  keywords: ["портфолио", "разработчик", "Kotlin", "Flutter", "React", "Python"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
