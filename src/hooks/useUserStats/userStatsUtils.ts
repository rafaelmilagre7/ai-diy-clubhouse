
import { CategoryData } from './types';

export const DEFAULT_STATS = {
  totalSolutions: 0,
  completedSolutions: 0,
  inProgressSolutions: 0,
  currentlyWorking: 0,
  totalLessonsCompleted: 0,
  certificates: 0,
  forumPosts: 0,
  joinedDate: new Date().toISOString(),
  completionRate: 0,
  averageCompletionTime: null,
  activeDays: 0,
  categoryDistribution: {
    Receita: { total: 0, completed: 0 },
    Operacional: { total: 0, completed: 0 },
    Estratégia: { total: 0, completed: 0 }
  },
  recentActivity: []
};

export const calculateCategoryDistribution = (
  solutions: any[],
  userProgress: any[]
): Record<string, CategoryData> => {
  const distribution: Record<string, CategoryData> = {
    Receita: { total: 0, completed: 0 },
    Operacional: { total: 0, completed: 0 },
    Estratégia: { total: 0, completed: 0 }
  };

  // Count solutions by category
  solutions.forEach(solution => {
    const category = solution.category || 'Operacional';
    if (distribution[category]) {
      distribution[category].total++;
    }
  });

  // Count completed solutions by category
  userProgress.forEach(progress => {
    if (progress.is_completed && progress.solution) {
      const category = progress.solution.category || 'Operacional';
      if (distribution[category]) {
        distribution[category].completed++;
      }
    }
  });

  return distribution;
};

export const calculateTimeMetrics = (
  completedSolutions: number,
  inProgressSolutions: number
) => {
  // Placeholder calculations - would need actual time tracking data
  const totalTimeSpent = (completedSolutions * 45) + (inProgressSolutions * 20);
  const avgTimePerSolution = completedSolutions > 0 ? Math.round(totalTimeSpent / completedSolutions) : 0;

  return {
    totalTimeSpent,
    avgTimePerSolution
  };
};

export const findLatestActivity = (userProgress: any[]): string | null => {
  if (!userProgress || userProgress.length === 0) return null;

  const activities = userProgress
    .filter(p => p.last_activity)
    .map(p => p.last_activity)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return activities.length > 0 ? activities[0] : null;
};
