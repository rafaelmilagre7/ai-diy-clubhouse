
import { useState } from 'react';

export const useFilters = () => {
  const [filter, setFilter] = useState<'popular' | 'recent'>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const filterSuggestions = (suggestions: any[]) => {
    return suggestions.filter(suggestion =>
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filterSuggestions
  };
};
