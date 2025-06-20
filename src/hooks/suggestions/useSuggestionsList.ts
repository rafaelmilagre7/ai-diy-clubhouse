
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion } from '@/types/suggestionTypes';

export const useSuggestionsList = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestions-list', selectedCategory, searchQuery],
    queryFn: async () => {
      console.log('Buscando lista de sugestões...', { selectedCategory, searchQuery });
      
      let query = supabase
        .from('suggestions_with_profiles')
        .select('*')
        .eq('is_hidden', false as any)
        .order('created_at', { ascending: false });

      // Filtrar por categoria se selecionada
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory as any);
      }

      // Filtrar por termo de busca
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar lista de sugestões:', error);
        throw error;
      }

      console.log('Lista de sugestões encontradas:', data?.length || 0);
      return ((data || []) as unknown) as Suggestion[];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    suggestions,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refetch
  };
};
