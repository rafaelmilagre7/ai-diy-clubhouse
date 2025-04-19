
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion } from '@/types/suggestionTypes';

export const useSuggestionsList = (categoryId?: string, filter: 'popular' | 'recent' = 'popular') => {
  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestions', categoryId, filter],
    queryFn: async () => {
      console.log('Buscando sugestões...', { categoryId, filter });
      
      let query = supabase
        .from('suggestions')
        .select(`
          *,
          profiles(name, avatar_url),
          category:category_id(name)
        `);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (filter === 'popular') {
        query = query.order('upvotes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        throw error;
      }

      console.log('Sugestões encontradas:', data?.length, data);
      return data || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minuto
  });

  return {
    suggestions,
    isLoading,
    error,
    refetch
  };
};
