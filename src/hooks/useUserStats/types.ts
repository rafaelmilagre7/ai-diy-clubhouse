
export type SolutionCategory = "revenue" | "operational" | "strategy";

export interface CategoryDistribution {
  revenue: number;
  operational: number;
  strategy: number;
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
}
