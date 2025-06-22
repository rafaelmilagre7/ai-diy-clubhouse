
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useAnalyticsCache = () => {
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['implementations'] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['solutions'] });
    queryClient.invalidateQueries({ queryKey: ['lms'] });
    queryClient.invalidateQueries({ queryKey: ['insights'] });
  }, [queryClient]);

  const prefetchData = useCallback((timeRange: string) => {
    // Prefetch dados principais
    queryClient.prefetchQuery({
      queryKey: ['analytics-overview', timeRange],
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return {
    invalidateAll,
    prefetchData,
    clearCache
  };
};
