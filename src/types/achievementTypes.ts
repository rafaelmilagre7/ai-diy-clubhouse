
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

export interface SolutionData {
  id: string;
  category: string;
  title?: string;
}

export interface ProgressData {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string; 
  last_activity?: string;
  completed_modules?: number[];
  solutions?: SolutionData | SolutionData[]; 
}

export interface ChecklistData {
  id: string;
  user_id: string;
  solution_id: string;
  checklist_id?: string; 
  checked_items?: any; 
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
  } | {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  }[];
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

// Cache de conquistas para persistir durante navegação
export const achievementCache = {
  achievements: [] as Achievement[],
  lastUpdated: 0,
  lastUpdatedUserId: null as string | null, // Adicionar ID do usuário para controle
  isValid(): boolean {
    // Cache válido por 5 minutos (aumentado de forma significativa)
    return this.achievements.length > 0 && (Date.now() - this.lastUpdated < 300000);
  },
  update(achievements: Achievement[], userId?: string): void {
    this.achievements = achievements;
    this.lastUpdated = Date.now();
    if (userId) {
      this.lastUpdatedUserId = userId;
    }
  },
  clear(): void {
    this.achievements = [];
    this.lastUpdated = 0;
    this.lastUpdatedUserId = null;
  }
};

// Helper para verificar se o objeto solutions é um array
export function isSolutionsArray(solutions: SolutionData | SolutionData[] | undefined): solutions is SolutionData[] {
  return Array.isArray(solutions);
}

// Helper para obter a categoria da solução de forma segura
export function getSolutionCategory(solutions: SolutionData | SolutionData[] | undefined): string {
  if (!solutions) return "";
  
  if (isSolutionsArray(solutions)) {
    return solutions.length > 0 ? solutions[0].category || "" : "";
  }
  
  return solutions.category || "";
}
