
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

/**
 * Hook otimizado para queries com configurações padrão
 */
export const useOptimizedQuery = <TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError>
) => {
  return useQuery({
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
};
