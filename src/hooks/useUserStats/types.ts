
export type SolutionCategory = "revenue" | "operational" | "strategy";

export interface CategoryCount {
  total: number;
  completed: number;
}

export interface CategoryDistribution {
  revenue: CategoryCount;
  operational: CategoryCount;
  strategy: CategoryCount;
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
