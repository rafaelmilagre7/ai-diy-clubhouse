
import { Solution } from "@/lib/supabase";

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
