
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion } from '@/types/suggestionTypes';

export type SuggestionFilter = 'all' | 'popular' | 'recent' | 'new' | 'in_development' | 'implemented';

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

        // Filtragem por termo de busca
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Filtragem por status
        if (filter === 'new') {
          query = query.eq('status', 'new');
        } else if (filter === 'in_development') {
          query = query.eq('status', 'in_development');
        } else if (filter === 'implemented') {
          query = query.eq('status', 'implemented');
        }

        // Ordenação
        if (filter === 'popular' || filter === 'new' || filter === 'in_development' || filter === 'implemented') {
          // Ordenar por votos líquidos (upvotes - downvotes) em ordem decrescente
          query = query.order('upvotes', { ascending: false });
        } else if (filter === 'recent') {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar sugestões:', error);
          throw error;
        }

        // Mapear dados para incluir user_name e user_avatar do perfil
        let mappedData = (data || []).map(suggestion => ({
          ...suggestion,
          user_name: suggestion.profiles?.name || 'Usuário',
          user_avatar: suggestion.profiles?.avatar_url || null,
          // Remover o objeto profiles aninhado para manter compatibilidade
          profiles: undefined
        }));

        // Ordenar por votos líquidos no frontend para garantir precisão
        if (filter === 'popular' || filter === 'new' || filter === 'in_development' || filter === 'implemented') {
          mappedData = mappedData.sort((a, b) => {
            const aNetVotes = (a.upvotes || 0) - (a.downvotes || 0);
            const bNetVotes = (b.upvotes || 0) - (b.downvotes || 0);
            return bNetVotes - aNetVotes; // Ordem decrescente
          });
        }

        return mappedData;
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
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch
  };
};
