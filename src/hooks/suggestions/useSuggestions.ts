
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  user_id: string;
  user_name: string;
  category_name?: string;
  category_id?: string;
}

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
      console.log('Simulando busca de sugestões...', { filter, searchQuery });
      
      // Mock data since suggestions table doesn't exist
      const mockSuggestions: Suggestion[] = [
        {
          id: '1',
          title: 'Implementar dashboard de analytics',
          description: 'Seria útil ter um dashboard com métricas detalhadas',
          status: 'new',
          upvotes: 15,
          downvotes: 2,
          created_at: new Date().toISOString(),
          user_id: 'user1',
          user_name: 'João Silva',
          category_name: 'Funcionalidades'
        },
        {
          id: '2',
          title: 'Melhorar performance do carregamento',
          description: 'O sistema poderia carregar mais rapidamente',
          status: 'in_development',
          upvotes: 8,
          downvotes: 1,
          created_at: new Date().toISOString(),
          user_id: 'user2',
          user_name: 'Maria Santos',
          category_name: 'Melhorias'
        }
      ];

      // Apply filters
      let filteredSuggestions = [...mockSuggestions];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredSuggestions = filteredSuggestions.filter(s => 
          s.title.toLowerCase().includes(query) || 
          s.description.toLowerCase().includes(query)
        );
      }

      if (filter !== 'all') {
        filteredSuggestions = filteredSuggestions.filter(s => s.status === filter);
      }

      // Sort by popularity (net votes)
      if (filter === 'popular') {
        filteredSuggestions.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      } else if (filter === 'recent') {
        filteredSuggestions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      console.log('Sugestões encontradas:', filteredSuggestions.length);
      return filteredSuggestions;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1,
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
