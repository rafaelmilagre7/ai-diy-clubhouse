
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
  created_at?: string; // Tornando opcional para compatibilidade
  last_activity?: string; // Adicionando campo que vem do Supabase
  completed_modules?: number[]; // Adicionando campo que vem do Supabase
  solutions?: SolutionData | SolutionData[]; // Pode ser um objeto ou um array
}

export interface ChecklistData {
  id: string;
  user_id: string;
  solution_id: string;
  checklist_id?: string; // Tornando opcional
  checked_items?: any; // Adicionando campo que vem do Supabase
  is_completed?: boolean; // Adicionando campo que vem do Supabase
  completed_at?: string;
}

export interface BadgeData {
  id: string;
  user_id?: string; // Tornando opcional
  badge_id: string;
  earned_at: string;
  badges: { // Modificando para aceitar tanto objeto quanto array
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

// Helper para verificar se o objeto solutions é um array
export function isSolutionsArray(solutions: SolutionData | SolutionData[] | undefined): solutions is SolutionData[] {
  return Array.isArray(solutions);
}

// Helper para obter a categoria da solução de forma segura
export function getSolutionCategory(solutions: SolutionData | SolutionData[] | undefined): string {
  if (!solutions) return "";
  
  if (isSolutionsArray(solutions)) {
    return solutions.length > 0 ? solutions[0].category : "";
  }
  
  return solutions.category;
}
