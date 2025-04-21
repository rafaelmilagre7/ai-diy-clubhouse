
import { Achievement } from "@/types/achievementTypes";
import { Award, Trophy, Star, CheckCheck, Medal } from "lucide-react";
/**
 * Retorna um ícone específico para cada conquista, baseado em regras fixas.
 * Sinta-se livre para melhorar a lógica conforme adicionar novas conquistas.
 */
export const getAchievementIcon = (achievement: Achievement) => {
  if (!achievement.isUnlocked) return Trophy;

  if (achievement.id.includes("primeira")) return Medal;
  if (achievement.id.includes("streak")) return CheckCheck;
  if (achievement.category === "revenue") return Star;
  if (achievement.category === "operational") return Medal;
  if (achievement.category === "strategy") return Star;
  if (achievement.category === "achievement") return Award;

  // Ícone padrão
  return Award;
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
