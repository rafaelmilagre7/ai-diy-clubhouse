
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

  // Aplicar filtros
  const suggestions = filterSuggestions(rawSuggestions);

  // Forçar refetch quando o componente montar
  useEffect(() => {
    refetch().catch(console.error);
  }, [refetch]);

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
