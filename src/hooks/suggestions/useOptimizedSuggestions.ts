
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion, SuggestionFilter } from '@/types/suggestionTypes';
import { useAuth } from '@/contexts/auth';

interface RawSuggestionData {
  id: string;
  title: string;
  description: string;
  user_id: string;
  status: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_hidden: boolean;
  profiles: {
    name: string;
    avatar_url: string;
  } | null;
  suggestion_votes: Array<{
    vote_type: 'upvote' | 'downvote';
    user_id: string;
  }>;
}

export const useOptimizedSuggestions = (
  filter: SuggestionFilter = 'popular',
  searchQuery: string = ''
) => {
  const { user } = useAuth();

  // Memoizar a query key para evitar re-renders desnecessários
  const queryKey = useMemo(() => [
    'suggestions-optimized',
    filter,
    searchQuery.trim(),
    user?.id
  ], [filter, searchQuery, user?.id]);

  // Query otimizada com cache inteligente
  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('🔄 Buscando sugestões otimizadas:', { filter, searchQuery: searchQuery.trim() });
      
      let query = supabase
        .from('suggestions')
        .select(`
          id,
          title,
          description,
          user_id,
          status,
          upvotes,
          downvotes,
          comment_count,
          created_at,
          updated_at,
          is_pinned,
          is_hidden,
          profiles:user_id (
            name,
            avatar_url
          ),
          suggestion_votes!left (
            vote_type,
            user_id
          )
        `)
        .eq('is_hidden', false)
        .limit(20); // Limitar para performance

      // Aplicar filtro de busca se existir
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);
      }

      // Aplicar ordenação baseada no filtro
      switch (filter) {
        case 'popular':
          query = query.order('upvotes', { ascending: false })
                      .order('created_at', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'in_development':
          query = query.eq('status', 'in_development')
                      .order('updated_at', { ascending: false });
          break;
        case 'completed':
          query = query.eq('status', 'completed')
                      .order('updated_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao buscar sugestões:', error);
        throw error;
      }

      console.log('✅ Sugestões carregadas:', data?.length);
      
      // Processar dados com validação robusta
      const processedData: Suggestion[] = data?.map((suggestion: any) => {
        // Garantir que profiles seja um objeto único, não array
        const profileData = Array.isArray(suggestion.profiles) 
          ? suggestion.profiles[0] 
          : suggestion.profiles;
          
        const userVote = suggestion.suggestion_votes?.find(
          (vote: any) => vote.user_id === user?.id
        );
        
        return {
          ...suggestion,
          user_name: profileData?.name || 'Usuário',
          user_avatar: profileData?.avatar_url || '',
          user_vote_type: userVote?.vote_type || null,
          profiles: profileData
        } as Suggestion;
      }) || [];

      return processedData;
    },
    staleTime: 1000 * 60 * 3, // 3 minutos - cache mais agressivo
    gcTime: 1000 * 60 * 10, // 10 minutos na memória
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });

  // Memoizar estatísticas para evitar recálculos
  const stats = useMemo(() => {
    const total = suggestions.length;
    const byStatus = suggestions.reduce((acc, suggestion) => {
      acc[suggestion.status] = (acc[suggestion.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byStatus };
  }, [suggestions]);

  return {
    suggestions,
    isLoading,
    error,
    refetch,
    isFetching,
    stats
  };
};
