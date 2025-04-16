
import { Solution } from "@/lib/supabase";

export interface UserProgress {
  solutionId: string;
  currentModule: number;
  isCompleted: boolean;
  completionDate: string | null;
  lastActivity: string;
}

export interface Dashboard {
  activeSolutions: Solution[];
  completedSolutions: Solution[];
  recommendedSolutions: Solution[];
  allSolutions: Solution[];
  userProgress: {[key: string]: UserProgress};
  loading: boolean;
}
