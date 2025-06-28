
export interface Dashboard {
  stats: {
    totalSolutions: number;
    completedSolutions: number;
    activeSolutions: number;
    totalTools: number;
  };
  recentSolutions: any[];
}

export interface UserProgress {
  solutionId: string;
  progress: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}
