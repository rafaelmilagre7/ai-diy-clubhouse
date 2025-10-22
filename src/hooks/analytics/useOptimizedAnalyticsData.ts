
import { useQuery } from '@tanstack/react-query';
import { useOptimizedAnalyticsCache } from './useOptimizedAnalyticsCache';
import { useDebouncedFilters } from './useDebouncedFilters';
import { useAnalyticsData } from './useAnalyticsData';

interface AnalyticsQueryMeta {
  fromCache?: boolean;
  cacheHit?: boolean;
  queryTime?: number;
}

interface OptimizedAnalyticsOptions {
  timeRange: string;
  category?: string;
  difficulty?: string;
  searchTerm?: string;
  enableCache?: boolean;
  debounceDelay?: number;
}

export const useOptimizedAnalyticsData = (options: OptimizedAnalyticsOptions) => {
  const {
    timeRange,
    category = 'all',
    difficulty = 'all',
    searchTerm = '',
    enableCache = true,
    debounceDelay = 300
  } = options;

  const { getCachedData, setCachedData, hasCache } = useOptimizedAnalyticsCache();
  
  const {
    filters: debouncedFilters,
    isDebouncing,
    filterHash
  } = useDebouncedFilters(
    { timeRange, category, difficulty, searchTerm },
    { delay: debounceDelay }
  );

  // Hook original como fallback
  const {
    data: fallbackData,
    loading: fallbackLoading,
    error: fallbackError
  } = useAnalyticsData({
    timeRange: debouncedFilters.timeRange,
    category: debouncedFilters.category,
    difficulty: debouncedFilters.difficulty
  });

  // Query otimizada com cache
  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
    isFetching
  } = useQuery({
    queryKey: ['optimized-analytics', filterHash],
    queryFn: async () => {
      const cacheKey = `analytics-${filterHash}`;
      
      // Verificar cache primeiro
      if (enableCache && hasCache(cacheKey)) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData && typeof cachedData === 'object' && cachedData !== null) {
          return {
            ...cachedData,
            _meta: { fromCache: true, cacheHit: true }
          };
        }
      }

      // Buscar dados frescos
      const startTime = Date.now();
      
      // Usar dados do fallback se disponível
      if (fallbackData && !fallbackLoading && !fallbackError) {
        const optimizedData = {
          ...fallbackData,
          _meta: {
            fromCache: false,
            cacheHit: false,
            queryTime: Date.now() - startTime
          }
        };

        // Cachear os dados
        if (enableCache) {
          setCachedData(cacheKey, optimizedData, 5 * 60 * 1000); // 5 minutos
        }

        return optimizedData;
      }

      // Se não há dados do fallback, retornar estrutura vazia
      const emptyData = {
        usersByTime: [],
        solutionPopularity: [],
        implementationsByCategory: [],
        userCompletionRate: [],
        dayOfWeekActivity: [],
        userRoleDistribution: [],
        userActivityByDay: [],
        _meta: {
          fromCache: false,
          cacheHit: false,
          queryTime: Date.now() - startTime
        }
      };

      if (enableCache) {
        setCachedData(cacheKey, emptyData, 1 * 60 * 1000); // 1 minuto para dados vazios
      }

      return emptyData;
    },
    enabled: !isDebouncing,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Processar dados com tipagem segura
  const processedData = queryData && typeof queryData === 'object' && queryData !== null ? {
    ...queryData,
    // Remover _meta dos dados finais para compatibilidade
    _meta: undefined
  } : fallbackData;

  // Extrair metadados com verificação de tipo
  const metadata = queryData && typeof queryData === 'object' && queryData !== null && '_meta' in queryData 
    ? queryData._meta as AnalyticsQueryMeta
    : undefined;

  return {
    data: processedData,
    loading: queryLoading || fallbackLoading || isDebouncing,
    error: queryError || fallbackError,
    isFetching,
    isDebouncing,
    metadata: {
      fromCache: metadata?.fromCache || false,
      cacheHit: metadata?.cacheHit || false,
      queryTime: metadata?.queryTime || 0,
      filterHash
    }
  };
};
