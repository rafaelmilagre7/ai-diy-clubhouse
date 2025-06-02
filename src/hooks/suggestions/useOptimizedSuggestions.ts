
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { SuggestionFilter, Suggestion } from '@/types/suggestionTypes';
import { useMemo } from 'react';

export const useOptimizedSuggestions = (filter: SuggestionFilter, searchQuery: string = '') => {
  const { user } = useAuth();

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['suggestions', filter, searchQuery, user?.id],
    queryFn: async () => {
      console.log('Buscando sugestões:', { filter, searchQuery });

      let query = supabase
        .from('suggestions')
        .select(`
          *,
          profiles:user_id(name, avatar_url),
          suggestion_categories:category_id(name, color)
        `);

      // Aplicar filtros de status
      switch (filter) {
        case 'popular':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'in_development':
          query = query.eq('status', 'in_development');
          break;
        case 'completed':
          query = query.eq('status', 'completed');
          break;
        default: // 'all'
          query = query.order('created_at', { ascending: false });
      }

      // Aplicar busca se houver
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data: suggestions, error } = await query.limit(50);

      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        throw error;
      }

      // Buscar votos do usuário se logado
      let userVotes: Record<string, string> = {};
      if (user && suggestions?.length) {
        const { data: votes } = await supabase
          .from('suggestion_votes')
          .select('suggestion_id, vote_type')
          .eq('user_id', user.id)
          .in('suggestion_id', suggestions.map(s => s.id));

        userVotes = (votes || []).reduce((acc, vote) => {
          acc[vote.suggestion_id] = vote.vote_type;
          return acc;
        }, {} as Record<string, string>);
      }

      // Combinar dados
      const enrichedSuggestions = (suggestions || []).map(suggestion => ({
        ...suggestion,
        user_name: suggestion.profiles?.name,
        user_avatar: suggestion.profiles?.avatar_url,
        user_vote_type: userVotes[suggestion.id] as 'upvote' | 'downvote' | null,
        category_name: suggestion.suggestion_categories?.name,
        category_color: suggestion.suggestion_categories?.color
      }));

      console.log('Sugestões encontradas:', enrichedSuggestions.length);
      return enrichedSuggestions;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false
  });

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!data) return { total: 0, byStatus: { popular: 0, recent: 0, in_development: 0, completed: 0, all: 0 } };

    const total = data.length;
    const popular = data.filter(s => s.upvotes > 5).length;
    const recent = data.filter(s => {
      const createdAt = new Date(s.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdAt > sevenDaysAgo;
    }).length;
    const in_development = data.filter(s => s.status === 'in_development').length;
    const completed = data.filter(s => s.status === 'completed').length;

    return {
      total,
      byStatus: {
        all: total,
        popular,
        recent,
        in_development,
        completed
      }
    };
  }, [data]);

  return {
    suggestions: data || [],
    isLoading,
    error,
    isFetching,
    refetch,
    stats
  };
};
