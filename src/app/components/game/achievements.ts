import type { AchievementId } from "./types";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_contact",      title: "First Contact",       description: "Активировал Game Mode",                       icon: "🎮" },
  { id: "background_check",   title: "Background Check",    description: "Прочитал секцию About",                        icon: "📜" },
  { id: "stat_inspection",    title: "Stat Inspection",     description: "Изучил все навыки",                            icon: "⚔️" },
  { id: "app_reviewer",       title: "App Reviewer",        description: "Пролистал все скриншоты VocabMaster",          icon: "📱" },
  { id: "storefront_auditor", title: "Storefront Auditor",  description: "Пролистал все скриншоты Hello Kitty Store",    icon: "🛍️" },
  { id: "code_inspector",     title: "Code Inspector",      description: "Открыл GitHub-проект",                         icon: "🌐" },
  { id: "treasure_hunter",    title: "Treasure Hunter",     description: "Собрал все 5 монет",                           icon: "💎" },
  { id: "konami_master",      title: "Konami Master",       description: "↑↑↓↓←→←→BA",                                  icon: "🕹️" },
  { id: "contract_signed",    title: "Contract Signed",     description: "Отправил контактную форму",                    icon: "📝" },
  { id: "master_hirer",       title: "Master Hirer",        description: "Собрал все ачивки и победил босса",            icon: "👑" },
];
