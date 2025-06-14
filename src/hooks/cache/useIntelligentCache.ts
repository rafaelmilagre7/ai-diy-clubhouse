
import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

interface CacheConfig {
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
  backgroundRefetch: boolean;
}

// Configurações de cache por tipo de dados
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  'solutions': {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    backgroundRefetch: true
  },
  'dashboard': {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: true,
    backgroundRefetch: true
  },
  'progress': {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: true,
    backgroundRefetch: true
  },
  'profile': {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false,
    backgroundRefetch: false
  }
};

export const useIntelligentCache = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Gerar chave de cache inteligente baseada no usuário e contexto
  const generateCacheKey = useCallback((
    type: string,
    identifier?: string | number,
    context?: Record<string, any>
  ) => {
    const baseKey = [type, user?.id];
    
    if (identifier) {
      baseKey.push(identifier);
    }
    
    if (context) {
      const contextKeys = Object.keys(context).sort();
      contextKeys.forEach(key => {
        baseKey.push(`${key}:${context[key]}`);
      });
    }
    
    return baseKey;
  }, [user?.id]);

  // Configuração otimizada para cada tipo de query
  const getQueryConfig = useCallback((type: string) => {
    return CACHE_CONFIGS[type] || CACHE_CONFIGS['solutions'];
  }, []);

  // Invalidação inteligente por relacionamentos
  const invalidateRelated = useCallback((type: string, identifier?: string) => {
    const invalidationMap: Record<string, string[]> = {
      'solutions': ['dashboard', 'progress'],
      'progress': ['dashboard', 'solutions'],
      'profile': ['dashboard'],
      'dashboard': [] // Dashboard não invalida outros caches
    };

    // Invalidar o cache principal
    queryClient.invalidateQueries({
      queryKey: generateCacheKey(type, identifier)
    });

    // Invalidar caches relacionados
    const related = invalidationMap[type] || [];
    related.forEach(relatedType => {
      queryClient.invalidateQueries({
        queryKey: [relatedType, user?.id]
      });
    });
  }, [queryClient, generateCacheKey, user?.id]);

  // Preload de dados relacionados
  const preloadRelated = useCallback(async (type: string, data: any) => {
    const preloadStrategies: Record<string, (data: any) => void> = {
      'solutions': (solutions) => {
        // Preload progress para as primeiras 5 soluções
        solutions.slice(0, 5).forEach((solution: any) => {
          queryClient.prefetchQuery({
            queryKey: generateCacheKey('progress', solution.id),
            queryFn: () => import('@/hooks/useSolutionProgress').then(m => 
              m.fetchSolutionProgress(solution.id, user?.id)
            ),
            ...getQueryConfig('progress')
          });
        });
      },
      'dashboard': () => {
        // Preload dados críticos do dashboard
        queryClient.prefetchQuery({
          queryKey: generateCacheKey('solutions'),
          queryFn: () => import('@/hooks/useSolutionsData').then(m => 
            m.fetchSolutionsData(user?.id)
          ),
          ...getQueryConfig('solutions')
        });
      }
    };

    const strategy = preloadStrategies[type];
    if (strategy) {
      strategy(data);
    }
  }, [queryClient, generateCacheKey, getQueryConfig, user?.id]);

  // Background sync para dados críticos
  const backgroundSync = useCallback((type: string) => {
    if (!CACHE_CONFIGS[type]?.backgroundRefetch) return;

    queryClient.refetchQueries({
      queryKey: [type, user?.id],
      type: 'active'
    });
  }, [queryClient, user?.id]);

  // Memoizar configurações para performance
  const memoizedConfig = useMemo(() => ({
    generateCacheKey,
    getQueryConfig,
    invalidateRelated,
    preloadRelated,
    backgroundSync
  }), [generateCacheKey, getQueryConfig, invalidateRelated, preloadRelated, backgroundSync]);

  return memoizedConfig;
};
