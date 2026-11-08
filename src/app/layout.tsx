import type { Metadata } from "next";
import "./globals.css";
import { CursorTrail } from "./components/animations/CursorTrail";
import { BootScreen, ScrollProgress } from "./components/animations/Motion";

export const metadata: Metadata = {
  title: "Жасмин Агабабян — системный аналитик, Product / Project Manager",
  description: "Портфолио Жасмин Агабабян: системный анализ, продуктовая и проектная работа — требования, SQL, API, MVP, проекты и хакатоны.",
  keywords: ["портфолио", "системный аналитик", "product manager", "project manager", "system analyst", "требования", "SQL", "API", "BPMN", "UML"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Скрипт в <head> решает до первой отрисовки, показывать ли заставку.
    // Иначе сервер отдаёт тёмный экран, и при каждом обновлении он мигает.
    <html lang="ru" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('boot-seen')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('boot-skip')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <BootScreen />
        <ScrollProgress />
        {children}
        <CursorTrail />
      </body>
    </html>
  );
}
