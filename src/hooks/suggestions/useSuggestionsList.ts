
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
      
      try {
        // Buscar sugestões com dados do perfil do usuário usando JOIN
        let query = supabase
          .from('suggestions')
          .select(`
            *,
            profiles!suggestions_user_id_fkey (
              name,
              avatar_url
            )
          `)
          .eq('is_hidden', false); // Apenas sugestões não ocultas

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

        // Mapear dados para incluir user_name e user_avatar do perfil
        const mappedData = (data || []).map(suggestion => ({
          ...suggestion,
          user_name: suggestion.profiles?.name || 'Usuário',
          user_avatar: suggestion.profiles?.avatar_url || null,
          // Remover o objeto profiles aninhado para manter compatibilidade
          profiles: undefined
        }));

        console.log('Sugestões encontradas:', mappedData?.length, mappedData);
        return mappedData || [];
      } catch (error) {
        console.error('Erro na consulta de sugestões:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minuto
    refetchOnMount: true,
  });

  return {
    suggestions,
    isLoading,
    error,
    refetch
  };
};
