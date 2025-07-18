import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface QueryConfig {
  enabled?: boolean;
  refetchOnMount?: boolean;
  cacheTime?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
}

interface QueryState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

/**
 * Hook padronizado para queries Supabase com cache, retry e error handling
 */
export function useSupabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  config: QueryConfig = {}
) {
  const { user } = useAuth();
  const {
    enabled = true,
    refetchOnMount = true,
    cacheTime = 5 * 60 * 1000, // 5 minutos
    staleTime = 30 * 1000, // 30 segundos
    retry = 3,
    retryDelay = 1000
  } = config;

  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false
  });

  const [lastFetch, setLastFetch] = useState<number>(0);

  const executeQuery = useCallback(async (retryCount = 0): Promise<void> => {
    if (!enabled || !user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Log de acesso seguro
      await supabase.rpc('log_critical_action', {
        p_action: `query_${queryKey}`,
        p_details: {
          query_key: queryKey,
          retry_count: retryCount,
          user_id: user.id.substring(0, 8) + '***'
        }
      });

      const result = await queryFn();

      if (result.error) {
        throw new Error(result.error.message || 'Query failed');
      }

      setState({
        data: result.data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true
      });

      setLastFetch(Date.now());

      logger.debug(`[QUERY] ${queryKey} executada com sucesso`, {
        dataLength: Array.isArray(result.data) ? result.data.length : 'single',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`[QUERY] Erro em ${queryKey}:`, error);

      if (retryCount < retry) {
        setTimeout(() => {
          executeQuery(retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        return;
      }

      setState({
        data: null,
        error: error as Error,
        isLoading: false,
        isError: true,
        isSuccess: false
      });
    }
  }, [queryKey, queryFn, enabled, user, retry, retryDelay]);

  // Verificar se dados estão stale
  const isStale = useCallback(() => {
    return Date.now() - lastFetch > staleTime;
  }, [lastFetch, staleTime]);

  // Função para refetch manual
  const refetch = useCallback(() => {
    executeQuery();
  }, [executeQuery]);

  // Effect principal
  useEffect(() => {
    if (!enabled || !user) return;

    const shouldFetch = refetchOnMount || state.data === null || isStale();
    
    if (shouldFetch) {
      executeQuery();
    }
  }, [enabled, user, refetchOnMount, executeQuery, isStale, state.data]);

  // Cleanup cache após cacheTime
  useEffect(() => {
    if (!state.data) return;

    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, data: null }));
      setLastFetch(0);
    }, cacheTime);

    return () => clearTimeout(timer);
  }, [state.data, cacheTime]);

  return {
    ...state,
    refetch,
    isStale: isStale()
  };
}

/**
 * Hook para mutations Supabase com rate limiting
 */
export function useSupabaseMutation<T, V = any>(
  mutationFn: (variables: V) => Promise<{ data: T | null; error: any }>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    rateLimitAction?: string;
    rateLimitPerHour?: number;
  } = {}
) {
  const { user } = useAuth();
  const { rateLimitAction, rateLimitPerHour = 60 } = options;

  const [state, setState] = useState({
    isLoading: false,
    error: null as Error | null
  });

  const mutate = useCallback(async (variables: V): Promise<T | null> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setState({ isLoading: true, error: null });

    try {
      // Verificar rate limit se especificado
      if (rateLimitAction) {
        const { data: canProceed } = await supabase.rpc('check_rate_limit', {
          p_action: rateLimitAction,
          p_limit_per_hour: rateLimitPerHour
        });

        if (!canProceed) {
          throw new Error('Rate limit excedido. Tente novamente mais tarde.');
        }
      }

      const result = await mutationFn(variables);

      if (result.error) {
        throw new Error(result.error.message || 'Mutation failed');
      }

      setState({ isLoading: false, error: null });
      options.onSuccess?.(result.data!);
      
      return result.data;

    } catch (error) {
      const errorObj = error as Error;
      setState({ isLoading: false, error: errorObj });
      options.onError?.(errorObj);
      throw errorObj;
    }
  }, [user, mutationFn, options, rateLimitAction, rateLimitPerHour]);

  return {
    mutate,
    isLoading: state.isLoading,
    error: state.error
  };
}