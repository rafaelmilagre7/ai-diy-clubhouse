
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useOptimizedSolutions = () => {
  const { data: solutions = [], isLoading, error } = useQuery({
    queryKey: ['optimized-solutions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('solutions')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    solutions,
    isLoading,
    loading: isLoading,
    error,
    cacheStatus: {
      isCached: false,
      cacheAge: 0
    },
    invalidateCache: () => console.log('Cache invalidated')
  };
};
