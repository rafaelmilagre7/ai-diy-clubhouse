
// Define solution category types for type safety
export type SolutionCategory = "revenue" | "operational" | "strategy";

// Type for category distribution metrics
export interface CategoryDistribution {
  revenue: { total: number; completed: number };
  operational: { total: number; completed: number };
  strategy: { total: number; completed: number };
}

// Comprehensive type for user statistics
export interface UserStats {
  totalSolutions: number;
  completedSolutions: number;
  inProgressSolutions: number;
  completionRate: number;
  totalTimeSpent: number;
  avgTimePerSolution: number;
  lastActivity: string | null;
  categoryDistribution: CategoryDistribution;
}
