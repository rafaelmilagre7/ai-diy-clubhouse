
// Importar o tipo Solution corretamente do sistema principal
import type { Solution } from "@/lib/supabase";

// Interface para progresso do usuário
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

// Interface principal do dashboard
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

// Re-exportar o tipo Solution para compatibilidade
export type { Solution };
