
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion } from '@/types/suggestionTypes';
import { useState } from 'react';

export const useSuggestions = () => {
  const [filter, setFilter] = useState<'popular' | 'recent'>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSuggestions = async (): Promise<Suggestion[]> => {
    console.log('Buscando sugestões...', { filter });
    
    try {
      let query = supabase
        .from('suggestions_with_profiles')
        .select('*');
        
      // Ordenar baseado no filtro selecionado
      if (filter === 'popular') {
        query = query.order('upvotes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        throw new Error(`Erro ao buscar sugestões: ${error.message}`);
      }
      
      console.log('Sugestões carregadas:', data?.length || 0);
      return data as Suggestion[];
    } catch (error: any) {
      console.error('Erro não esperado ao buscar sugestões:', error);
      throw error;
    }
  };

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['suggestions', filter], // Adicionado filter como parte da chave para refetch automático
    queryFn: fetchSuggestions,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Filtramos as sugestões baseado na pesquisa
  const filteredSuggestions = data.filter(suggestion =>
    suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    suggestions: filteredSuggestions, // Retorna as sugestões filtradas
    isLoading,
    error,
    refetch,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery
  };
};
