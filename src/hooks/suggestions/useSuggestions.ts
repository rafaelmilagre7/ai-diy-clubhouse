
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion } from '@/types/suggestionTypes';

export type SuggestionFilter = 'all' | 'popular' | 'recent';

export const useSuggestions = () => {
  const [filter, setFilter] = useState<SuggestionFilter>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestions', filter, searchQuery],
    queryFn: async () => {
      try {
        // Busca simplificada
        let query = supabase
          .from('suggestions_with_profiles')
          .select('*')
          .eq('is_hidden', false);

        // Filtragem por termo de busca
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Ordenação básica
        if (filter === 'popular') {
          query = query.order('upvotes', { ascending: false });
        } else if (filter === 'recent') {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Erro na consulta de sugestões:', error);
        throw error;
      }
    },
  });

  return {
    suggestions,
    isLoading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch
  };
};
