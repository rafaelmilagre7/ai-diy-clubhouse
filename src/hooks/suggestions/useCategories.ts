
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SuggestionCategory } from '@/types/suggestionTypes';

export const useCategories = () => {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error
  } = useQuery({
    queryKey: ['suggestion-categories'],
    queryFn: async () => {
      console.log('[useCategories] Buscando categorias de sugestões...');
      
      const { data, error } = await supabase
        .from('suggestion_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('[useCategories] Erro ao buscar categorias:', error);
        throw error;
      }

      console.log('[useCategories] Categorias carregadas:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    refetchOnWindowFocus: false,
  });

  return {
    categories,
    isLoading: categoriesLoading,
    error: error ? String(error) : null
  };
};
