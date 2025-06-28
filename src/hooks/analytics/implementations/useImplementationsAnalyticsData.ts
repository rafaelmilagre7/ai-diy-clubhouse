
import { useImplementationQueries } from './queries/implementationQueries';

export const useImplementationsAnalyticsData = () => {
  const {
    getImplementationStats,
    getImplementationTrends
  } = useImplementationQueries();

  // Chamar as queries sem argumentos
  const statsQuery = getImplementationStats;
  const trendsQuery = getImplementationTrends;

  return {
    stats: {
      data: statsQuery.data,
      isLoading: statsQuery.isLoading,
      error: statsQuery.error
    },
    trends: {
      data: trendsQuery.data,
      isLoading: trendsQuery.isLoading,
      error: trendsQuery.error
    },
    // Compatibility functions that return promises
    fetchCompletionData: async () => {
      return statsQuery.data?.solutions || [];
    },
    fetchDifficultyData: async () => {
      return statsQuery.data?.solutions || [];
    },
    fetchTimeCompletionData: async () => {
      return statsQuery.data?.analytics || [];
    },
    fetchRecentImplementations: async () => {
      return statsQuery.data?.solutions?.slice(0, 10) || [];
    }
  };
};
