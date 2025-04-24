
import { Solution as SupabaseSolution } from "@/lib/supabase";

// Definir tipo Solution que estende a SupabaseSolution mas torna author_id opcional
export interface Solution extends Omit<SupabaseSolution, 'author_id'> {
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
