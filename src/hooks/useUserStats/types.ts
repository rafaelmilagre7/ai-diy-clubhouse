
export type SolutionCategory = "Receita" | "Operacional" | "Estratégia";

export interface CategoryCount {
  total: number;
  completed: number;
}

export interface CategoryDistribution {
  Receita: CategoryCount;
  Operacional: CategoryCount;
  Estratégia: CategoryCount;
}

export interface UserStats {
  totalSolutions: number;
  completedSolutions: number;
  inProgressSolutions: number;
  completionRate: number;
  averageCompletionTime: number | null;
  activeDays: number;
  categoryDistribution: CategoryDistribution;
  recentActivity: {
    date: string;
    action: string;
    solution?: string;
  }[];
  totalTimeSpent?: number;
  avgTimePerSolution?: number;
  lastActivity?: Date | null;
  activeSolutions?: number;
  achievements?: number;
}
