
/**
 * Tipos relacionados a dados de implementações
 */

export interface ImplementationData {
  completionRate: {
    completed: number;
    inProgress: number;
  };
  implementationsByDifficulty: Array<{
    difficulty: string;
    count: number;
  }>;
  averageCompletionTime: Array<{
    solutionId: string;
    solutionTitle: string;
    avgDays: number;
    count: number;
  }>;
  abandonmentByModule: Array<{
    moduleOrder: number;
    moduleTitle: string;
    abandonmentRate: number;
    totalStarts: number;
  }>;
  recentImplementations: Array<{
    id: string;
    solutionTitle: string;
    userName: string;
    status: string;
    lastActivity: string;
    percentComplete: number;
  }>;
}
