
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SuggestionCategory } from '@/types/suggestionTypes';

export const useCategories = () => {
  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['suggestion-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestion_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      return data || [];
    },
  });

  return {
    categories,
    isLoading: categoriesLoading
  };
};
