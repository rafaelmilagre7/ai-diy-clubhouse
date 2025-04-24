
import { Solution as SupabaseSolution } from "@/lib/supabase/types";

// Definir tipo Solution compatível com a definição do Supabase
export interface Solution extends Omit<SupabaseSolution, 'creator_id'> {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  slug: string;
  tags?: string[];
  estimated_time?: number;
  success_rate?: number;
  related_solutions?: string[];
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
