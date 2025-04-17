
import { Achievement } from "@/types/achievementTypes";
import { Award, Flame, Zap, CheckCircle, Star, Timer, Target, Trophy } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const getAchievementIcon = (achievement: Achievement): LucideIcon => {
  if (!achievement.isUnlocked) return Trophy;
  
  if (achievement.id.includes('streak')) return Flame;
  if (achievement.id.includes('speed')) return Zap;
  if (achievement.id.includes('checklist')) return CheckCircle;
  if (achievement.id.includes('perfect')) return Star;
  if (achievement.id.includes('early')) return Timer;
  if (achievement.id.includes('implementation')) return Target;
  
  return Award;
};
