
import { useQuery } from '@tanstack/react-query';

interface OptimizedQueryOptions {
  queryKey: (string | number | boolean | null | undefined)[];
  queryFn: () => Promise<any>;
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

/**
 * Hook otimizado para queries que evita problemas de dependência
 */
export const useOptimizedQuery = ({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutos
  refetchOnWindowFocus = false,
  retry = 2
}: OptimizedQueryOptions) => {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
    refetchOnWindowFocus,
    retry
  });
};
