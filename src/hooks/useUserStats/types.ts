
export interface UserStats {
  totalSolutions: number;
  completedSolutions: number;
  inProgressSolutions: number;
  currentlyWorking: number;
  totalLessonsCompleted: number;
  certificates: number;
  forumPosts: number;
  joinedDate: string;
  completionRate: number;
  averageCompletionTime: number | null;
  activeDays: number;
  categoryDistribution: {
    [key: string]: {
      total: number;
      completed: number;
    };
  };
  recentActivity: Array<{
    date: string;
    action: string;
    solution?: string;
  }>;
  totalTimeSpent?: number;
  avgTimePerSolution?: number;
  lastActivity?: Date | null;
}

export interface CategoryData {
  total: number;
  completed: number;
}
