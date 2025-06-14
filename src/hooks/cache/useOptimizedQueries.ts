
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useIntelligentCache } from './useIntelligentCache';
import { useCallback } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  cacheType: string;
  identifier?: string | number;
  context?: Record<string, any>;
  selectFields?: string[];
  enablePreload?: boolean;
  onQuerySuccess?: (data: T) => void; // Renomeado para evitar conflito
}

export const useOptimizedQuery = <T>(
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T>
) => {
  const { 
    generateCacheKey, 
    getQueryConfig, 
    preloadRelated 
  } = useIntelligentCache();

  const {
    cacheType,
    identifier,
    context,
    selectFields,
    enablePreload = false,
    onQuerySuccess,
    ...queryOptions
  } = options;

  // Gerar chave otimizada
  const queryKey = generateCacheKey(cacheType, identifier, context);

  // Configuração de cache baseada no tipo
  const cacheConfig = getQueryConfig(cacheType);

  // Otimizar query function para select específicos
  const optimizedQueryFn = useCallback(async () => {
    const result = await queryFn();
    
    // Callback de sucesso personalizado
    if (onQuerySuccess && result) {
      onQuerySuccess(result);
    }
    
    // Preload dados relacionados se habilitado
    if (enablePreload && result) {
      preloadRelated(cacheType, result);
    }
    
    return result;
  }, [queryFn, enablePreload, preloadRelated, cacheType, onQuerySuccess]);

  return useQuery({
    queryKey,
    queryFn: optimizedQueryFn,
    ...cacheConfig,
    ...queryOptions,
    // Configurações de performance
    structuralSharing: true,
    throwOnError: false,
    retry: (failureCount, error: any) => {
      // Retry inteligente baseado no tipo de erro
      if (error?.message?.includes('auth')) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

// Hook especializado para queries de lista com paginação
export const useOptimizedListQuery = <T>(
  queryFn: (page: number, limit: number) => Promise<T[]>,
  options: OptimizedQueryOptions<T[]> & {
    page?: number;
    limit?: number;
    enableInfiniteScroll?: boolean;
  }
) => {
  const { page = 1, limit = 20, enableInfiniteScroll = false, ...queryOptions } = options;

  const optimizedQueryFn = useCallback(() => {
    return queryFn(page, limit);
  }, [queryFn, page, limit]);

  return useOptimizedQuery(optimizedQueryFn, {
    ...queryOptions,
    context: {
      ...queryOptions.context,
      page,
      limit,
      infiniteScroll: enableInfiniteScroll
    }
  });
};

// Hook para queries com dependências
export const useOptimizedDependentQuery = <T, D>(
  queryFn: (dependency: D) => Promise<T>,
  dependency: D | undefined,
  options: OptimizedQueryOptions<T>
) => {
  const enabled = dependency !== undefined && options.enabled !== false;

  const optimizedQueryFn = useCallback(() => {
    if (!dependency) throw new Error('Dependency not available');
    return queryFn(dependency);
  }, [queryFn, dependency]);

  return useOptimizedQuery(optimizedQueryFn, {
    ...options,
    enabled,
    context: {
      ...options.context,
      dependencyHash: dependency ? JSON.stringify(dependency).slice(0, 20) : undefined
    }
  });
};
