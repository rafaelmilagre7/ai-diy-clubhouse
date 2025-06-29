
import { SolutionCategory, CategoryDistribution, UserStats } from './types';

// Default empty state for user stats
export const DEFAULT_STATS: UserStats = {
  totalSolutions: 0,
  completedSolutions: 0,
  inProgressSolutions: 0,
  completionRate: 0,
  averageCompletionTime: null,
  activeDays: 0,
  categoryDistribution: {
    Receita: { total: 0, completed: 0 },
    Operacional: { total: 0, completed: 0 },
    Estratégia: { total: 0, completed: 0 }
  },
  recentActivity: [],
  totalTimeSpent: 0,
  avgTimePerSolution: 0,
  lastActivity: null
};

// Calculate category distribution based on solutions and progress
export const calculateCategoryDistribution = (
  solutions: any[],
  userProgress: any[]
): CategoryDistribution => {
  // Initialize category distribution
  const categoryDistribution: CategoryDistribution = {
    Receita: { total: 0, completed: 0 },
    Operacional: { total: 0, completed: 0 },
    Estratégia: { total: 0, completed: 0 }
  };

  // Count solutions by category
  solutions.forEach(solution => {
    const category = solution.category as SolutionCategory;
    if (category in categoryDistribution) {
      categoryDistribution[category].total++;
    }
  });

  // Count completed solutions by category
  if (userProgress.length > 0 && solutions.length > 0) {
    // Create a map for faster lookups
    const solutionMap = new Map(
      solutions.map(s => [s.id, s.category as SolutionCategory])
    );
    
    userProgress.forEach(progress => {
      if (progress.is_completed && solutionMap.has(progress.solution_id)) {
        const category = solutionMap.get(progress.solution_id) as SolutionCategory;
        if (category in categoryDistribution) {
          categoryDistribution[category].completed++;
        }
      }
    });
  }

  return categoryDistribution;
};

// Calculate time metrics based on completed and in-progress solutions
export const calculateTimeMetrics = (
  completedSolutions: number,
  inProgressSolutions: number
) => {
  const totalTimeSpent = completedSolutions * 45 + inProgressSolutions * 20; // minutes
  const avgTimePerSolution = completedSolutions > 0 
    ? Math.round(totalTimeSpent / completedSolutions) 
    : 0;

  return { totalTimeSpent, avgTimePerSolution };
};

// Find the latest activity date from user progress
export const findLatestActivity = (userProgress: any[]): string | null => {
  return userProgress.length > 0 
    ? userProgress.sort((a, b) => 
        new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      )[0].last_activity 
    : null;
};
