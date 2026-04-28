import type { Metadata } from "next";
import "./globals.css";
import { CursorTrail } from "./components/animations/CursorTrail";
import { GameProvider } from "./components/game/GameProvider";
import { ActivationCutscene } from "./components/game/ActivationCutscene";
import { HUDTopBar } from "./components/game/HUD/HUDTopBar";
import { HUDToast } from "./components/game/HUD/HUDToast";
import { HUDAchievements } from "./components/game/HUD/HUDAchievements";
import { HUDControls } from "./components/game/HUD/HUDControls";
import { HUDBodyClass } from "./components/game/HUDBodyClass";

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
      <body className="min-h-full flex flex-col">
        <GameProvider>
          <HUDBodyClass />
          <HUDTopBar />
          {children}
          <HUDToast />
          <HUDAchievements />
          <HUDControls />
          <ActivationCutscene />
          <CursorTrail />
        </GameProvider>
      </body>
    </html>
  );
}
