
import { Solution as BaseSolution } from "@/lib/supabase";

// Estender o tipo Solution para incluir a propriedade modules
export interface Solution extends BaseSolution {
  modules?: {
    id: string;
    title: string;
    type: string;
    module_order: number;
    content?: any;
  }[];
  author_id?: string; // Tornando o campo opcional para compatibilidade
}

export interface UserProgress {
  [solutionId: string]: {
    started: boolean;
    modules: {
      [moduleId: string]: {
        completed: boolean;
        lastAccessed: string;
      }
    };
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
