
// CORREÇÃO: Removendo interface duplicada e usando a unificada
import { Solution } from "@/lib/supabase/types";

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

// Interface para atividades recentes
export interface RecentActivity {
  id: string;
  user_id: string;
  event_type: string;
  solution?: string;
  created_at: string;
}
