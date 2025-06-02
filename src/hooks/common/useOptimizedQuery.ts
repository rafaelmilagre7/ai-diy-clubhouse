
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Hook otimizado para React Query com configurações padrão
 */
export const useOptimizedQuery = <TData, TError = Error>(
  options: UseQueryOptions<TData, TError>
) => {
  // Configurações otimizadas padrão
  const optimizedOptions = useMemo(() => ({
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    ...options
  }), [options]);

  return useQuery(optimizedOptions);
};

/**
 * Hook para queries que devem ser executadas apenas uma vez
 */
export const useStaticQuery = <TData, TError = Error>(
  options: UseQueryOptions<TData, TError>
) => {
  const staticOptions = useMemo(() => ({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...options
  }), [options]);

  return useQuery(staticOptions);
};
