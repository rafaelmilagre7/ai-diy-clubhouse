
import { useEffect } from 'react';
import { useCategories } from './useCategories';
import { useFilters } from './useFilters';
import { useSuggestionsList } from './useSuggestionsList';

export const useSuggestions = (categoryId?: string) => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { filter, setFilter, searchQuery, setSearchQuery, filterSuggestions } = useFilters();
  const { 
    suggestions: rawSuggestions, 
    isLoading: suggestionsLoading, 
    error,
    refetch 
  } = useSuggestionsList(categoryId, filter);

  // Aplicar filtros somente se houver sugestões
  const suggestions = rawSuggestions ? filterSuggestions(rawSuggestions) : [];

  // Forçar refetch quando o componente montar ou o filtro/categoria mudar
  useEffect(() => {
    console.log("useSuggestions hook: forçando refetch inicial...");
    refetch().catch(error => {
      console.error("Erro ao fazer refetch inicial:", error);
    });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, categoryId]); 

  return {
    suggestions,
    categories,
    isLoading: suggestionsLoading || categoriesLoading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch
  };
};
