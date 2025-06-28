
import { useImplementationQueries } from './queries/implementationQueries';
import { ImplementationData } from './types/implementationTypes';

// Use export type for isolated modules
export type { ImplementationData } from './types/implementationTypes';

export const useImplementationsAnalyticsData = () => {
  const {
    getImplementationStats,
    getImplementationTrends
  } = useImplementationQueries();

  // Gerar dados mock baseados nas queries
  const mockImplementationData: ImplementationData = {
    completionRate: {
      completed: getImplementationStats.data?.completedImplementations || 0,
      inProgress: (getImplementationStats.data?.totalImplementations || 0) - (getImplementationStats.data?.completedImplementations || 0)
    },
    implementationsByDifficulty: [
      { difficulty: 'beginner', count: 15 },
      { difficulty: 'intermediate', count: 8 },
      { difficulty: 'advanced', count: 3 }
    ],
    averageCompletionTime: [
      { solutionId: '1', solutionTitle: 'IA para Vendas', avgDays: 7, count: 5 },
      { solutionId: '2', solutionTitle: 'Automação de Marketing', avgDays: 14, count: 3 }
    ],
    abandonmentByModule: [
      { moduleOrder: 1, moduleTitle: 'Introdução', abandonmentRate: 5, totalStarts: 100 },
      { moduleOrder: 2, moduleTitle: 'Configuração', abandonmentRate: 15, totalStarts: 95 }
    ],
    recentImplementations: [
      {
        id: '1',
        solutionTitle: 'IA para Vendas',
        userName: 'João Silva',
        status: 'Em andamento',
        lastActivity: '2 horas atrás',
        percentComplete: 65
      }
    ]
  };

  return {
    data: mockImplementationData,
    isLoading: getImplementationStats.isLoading,
    error: getImplementationStats.error,
    refetch: () => getImplementationStats.refetch(),
    
    // Compatibility functions that return promises
    fetchCompletionData: async () => {
      return getImplementationStats.data?.solutions || [];
    },
    fetchDifficultyData: async () => {
      return getImplementationStats.data?.solutions || [];
    },
    fetchTimeCompletionData: async () => {
      return getImplementationStats.data?.analytics || [];
    },
    fetchRecentImplementations: async () => {
      return getImplementationStats.data?.solutions?.slice(0, 10) || [];
    }
  };
};
