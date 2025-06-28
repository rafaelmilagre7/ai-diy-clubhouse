
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
      
      // Mock data since suggestions_with_profiles view doesn't exist
      const mockSuggestions: Suggestion[] = [
        {
          id: '1',
          title: 'Nova funcionalidade X',
          description: 'Descrição da funcionalidade solicitada',
          status: 'new',
          upvotes: 10,
          downvotes: 1,
          created_at: new Date().toISOString(),
          user_id: 'user1',
          user_name: 'Usuário Teste',
          category: { name: 'Funcionalidades' },
          category_id: '1'
        },
        {
          id: '2',
          title: 'Melhoria na interface',
          description: 'Sugestão de melhoria na UI/UX',
          status: 'in_development',
          upvotes: 7,
          downvotes: 0,
          created_at: new Date().toISOString(),
          user_id: 'user2',
          user_name: 'Outro Usuário',
          category: { name: 'Interface' },
          category_id: '2'
        }
      ];

      // Apply filters
      let filteredSuggestions = [...mockSuggestions];

      if (selectedCategory && selectedCategory !== 'all') {
        filteredSuggestions = filteredSuggestions.filter(s => s.category_id === selectedCategory);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredSuggestions = filteredSuggestions.filter(s =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
        );
      }

      console.log('Lista de sugestões encontradas:', filteredSuggestions.length);
      return filteredSuggestions;
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
