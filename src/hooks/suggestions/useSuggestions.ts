
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion, SuggestionFilter } from '@/types/suggestionTypes';

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
      console.log('Buscando sugestões com filtro:', filter, 'e busca:', searchQuery);
      
      let query = supabase
        .from('suggestions')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          ),
          suggestion_votes!left (
            vote_type,
            user_id
          )
        `);

      // Aplicar filtro de busca se existir
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Aplicar filtros específicos
      switch (filter) {
        case 'popular':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'in_development':
          query = query.eq('status', 'in_development').order('created_at', { ascending: false });
          break;
        case 'completed':
          query = query.eq('status', 'completed').order('updated_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        throw error;
      }

      console.log('Sugestões carregadas:', data?.length);
      
      // Processar os dados para incluir informações de voto do usuário
      const processedData = data?.map(suggestion => {
        const userVote = suggestion.suggestion_votes?.find(
          vote => vote.user_id === (supabase.auth.getUser().then(u => u.data.user?.id))
        );
        
        return {
          ...suggestion,
          user_name: suggestion.profiles?.name,
          user_avatar: suggestion.profiles?.avatar_url,
          user_vote_type: userVote?.vote_type || null
        };
      }) || [];

      return processedData as Suggestion[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
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
