
import { SolutionCategory } from "@/lib/types/categoryTypes";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: "achievement" | SolutionCategory;
  requiredCount?: number;
  currentCount?: number;
  isUnlocked: boolean;
  earnedAt?: string;
  level?: number;
}

export interface ProgressData {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  solutions?: {
    id: string;
    category: string;
  };
}

export interface ChecklistData {
  id: string;
  user_id: string;
  checklist_id: string;
  solution_id: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface BadgeData {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  };
}

// Utilitário para verificar se uma string é uma categoria de solução válida
export function isValidCategory(category: string): category is "achievement" | SolutionCategory {
  return category === "achievement" || 
         category === "revenue" || 
         category === "operational" || 
         category === "strategy";
}

// Utilitário para garantir que uma categoria de badge seja válida
export function ensureValidCategory(category: string): "achievement" | SolutionCategory {
  if (isValidCategory(category)) {
    return category;
  }
  return "achievement"; // Valor padrão seguro
}

// Novo: Cache de conquistas para persistir durante navegação
export const achievementCache = {
  achievements: [] as Achievement[],
  lastUpdated: 0,
  isValid(): boolean {
    // Cache válido por 5 minutos
    return this.achievements.length > 0 && (Date.now() - this.lastUpdated < 300000);
  },
  update(achievements: Achievement[]): void {
    this.achievements = achievements;
    this.lastUpdated = Date.now();
  },
  clear(): void {
    this.achievements = [];
    this.lastUpdated = 0;
  }
};
