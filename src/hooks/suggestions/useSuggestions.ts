
import { useState } from 'react';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { useOptimizedSuggestions } from './useOptimizedSuggestions';

export const useSuggestions = () => {
  const [filter, setFilter] = useState<SuggestionFilter>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    suggestions,
    isLoading,
    error,
    refetch,
    isFetching,
    stats
  } = useOptimizedSuggestions(filter, searchQuery);

  return {
    suggestions,
    isLoading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch,
    isFetching,
    stats
  };
};
