
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/analytics/useDebounce';

interface CacheConfig {
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
}

export const useInviteCache = () => {
  const queryClient = useQueryClient();

  const cacheConfigs: Record<string, CacheConfig> = useMemo(() => ({
    'invites-list': {
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false
    },
    'invite-analytics': {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false
    },
    'invite-audit': {
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos
      refetchOnWindowFocus: false
    }
  }), []);

  const invalidateInviteData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['invites'] });
    queryClient.invalidateQueries({ queryKey: ['invite-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['invite-deliveries'] });
  }, [queryClient]);

  const prefetchInviteData = useCallback(async () => {
    try {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['invites-list'],
          ...cacheConfigs['invites-list']
        }),
        queryClient.prefetchQuery({
          queryKey: ['invite-analytics', '30d'],
          ...cacheConfigs['invite-analytics']
        })
      ]);
    } catch (error) {
      console.warn('Erro ao fazer prefetch de dados:', error);
    }
  }, [queryClient, cacheConfigs]);

  const clearInviteCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['invites'] });
    queryClient.removeQueries({ queryKey: ['invite-analytics'] });
    queryClient.removeQueries({ queryKey: ['invite-audit'] });
  }, [queryClient]);

  const optimizeQuery = useCallback((queryKey: string[]) => {
    const baseKey = queryKey[0];
    return cacheConfigs[baseKey] || cacheConfigs['invites-list'];
  }, [cacheConfigs]);

  return {
    invalidateInviteData,
    prefetchInviteData,
    clearInviteCache,
    optimizeQuery,
    cacheConfigs
  };
};
