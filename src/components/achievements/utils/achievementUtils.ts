
import { Achievement } from "@/types/achievementTypes";
import { 
  Award, 
  Trophy, 
  Star, 
  CheckCheck, 
  Medal, 
  FileCheck, 
  CalendarCheck, 
  Users, 
  Clock 
} from "lucide-react";

/**
 * Retorna um ícone específico para cada conquista, baseado em categorias e padrões no ID.
 * Lógica expandida para oferecer mais variedade visual.
 */
export const getAchievementIcon = (achievement: Achievement) => {
  // Para conquistas bloqueadas, sempre usar o troféu em cinza
  if (!achievement.isUnlocked) return Trophy;

  // Ícones baseados no ID da conquista (padrões específicos)
  if (achievement.id.includes("primeira")) return Medal;
  if (achievement.id.includes("streak")) return CalendarCheck;
  if (achievement.id.includes("completo")) return FileCheck;
  if (achievement.id.includes("implementacao")) return CheckCheck;
  if (achievement.id.includes("social") || achievement.id.includes("comentario")) return Users;
  if (achievement.id.includes("tempo") || achievement.id.includes("dias")) return Clock;

  // Ícones baseados na categoria da conquista
  switch (achievement.category) {
    case "revenue":
      return Star;
    case "operational":
      return CheckCheck;
    case "strategy":
      return FileCheck;
    case "achievement":
      return Award;
    default:
      return Trophy; // Ícone padrão
  }
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
