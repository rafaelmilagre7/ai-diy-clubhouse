
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion, SuggestionFilter } from '@/types/suggestionTypes';
import { useAuth } from '@/contexts/auth';

export const useEnhancedSuggestions = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<SuggestionFilter>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Memoizar a query key para evitar re-renders desnecessários
  const queryKey = useMemo(() => [
    'suggestions-enhanced',
    filter,
    searchQuery.trim(),
    selectedCategory,
    selectedStatus,
    user?.id
  ], [filter, searchQuery, selectedCategory, selectedStatus, user?.id]);

  // Query otimizada com filtros avançados
  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('🔄 Buscando sugestões com filtros:', { 
        filter, 
        searchQuery: searchQuery.trim(), 
        selectedCategory, 
        selectedStatus 
      });
      
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
          category_id,
          profiles!suggestions_user_id_fkey (
            name,
            avatar_url
          ),
          suggestion_categories!suggestions_category_id_fkey (
            name,
            color
          ),
          suggestion_votes!left (
            vote_type,
            user_id
          )
        `)
        .eq('is_hidden', false);

      // Aplicar filtro de busca se existir
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);
      }

      // Aplicar filtro de categoria
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      // Aplicar filtro de status
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
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

      // Limitar para performance (pode implementar paginação depois)
      query = query.limit(50);

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao buscar sugestões:', error);
        throw error;
      }

      console.log('✅ Sugestões carregadas:', data?.length);
      
      // Processar dados com validação robusta
      const processedData: Suggestion[] = data?.map((suggestion: any) => {
        const profileData = suggestion.profiles;
        const categoryData = suggestion.suggestion_categories;
          
        const userVote = suggestion.suggestion_votes?.find(
          (vote: any) => vote.user_id === user?.id
        );
        
        return {
          ...suggestion,
          user_name: profileData?.name || 'Usuário',
          user_avatar: profileData?.avatar_url || '',
          user_vote_type: userVote?.vote_type || null,
          category_name: categoryData?.name,
          category_color: categoryData?.color,
          profiles: profileData,
          suggestion_categories: categoryData
        } as Suggestion;
      }) || [];

      return processedData;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
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

    const byCategory = suggestions.reduce((acc, suggestion) => {
      if (suggestion.category_id) {
        acc[suggestion.category_id] = (acc[suggestion.category_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, byStatus, byCategory };
  }, [suggestions]);

  return {
    suggestions,
    isLoading,
    error,
    refetch,
    isFetching,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus
  };
};
