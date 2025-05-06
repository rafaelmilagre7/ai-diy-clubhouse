
import { Solution as SupabaseSolution } from "@/lib/supabase";
import { SolutionCategory } from "@/lib/types/categoryTypes";

// Definir tipo Solution que estende a SupabaseSolution mas torna author_id opcional
export interface Solution extends Omit<SupabaseSolution, 'author_id' | 'category'> {
  id: string;
  title: string;
  description: string;
  category: SolutionCategory;
  difficulty: "easy" | "medium" | "advanced" | "expert";
  published: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null; // Modificado: agora é obrigatório mas aceita null
  slug: string;
  tags?: string[];
  estimated_time?: number;
  success_rate?: number;
  related_solutions?: string[];
  checklist_items: any[];
  implementation_steps: any[];
  completion_requirements: any;
  author_id?: string;
  modules?: any[];
}

export interface UserProgress {
  [key: string]: {
    started: boolean;
    modules: Record<string, {
      completed: boolean;
      lastAccessed: string;
    }>;
    lastAccessed: string;
    completedModules: number;
    totalModules: number;
  }
}

export interface Dashboard {
  activeSolutions: Solution[];
  completedSolutions: Solution[];
  recommendedSolutions: Solution[];
  allSolutions: Solution[];
  userProgress: UserProgress;
  loading: boolean;
}
