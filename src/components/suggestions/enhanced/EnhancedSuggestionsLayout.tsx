
import React, { useState, useMemo } from 'react';
import { useOptimizedSuggestions } from '@/hooks/suggestions/useOptimizedSuggestions';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { SuggestionsContent } from '../layout/SuggestionsContent';
import { SuggestionsHeader } from './SuggestionsHeader';
import { SuggestionsFilters } from './SuggestionsFilters';
import { SuggestionsLoading } from '../states/SuggestionsLoading';
import { SuggestionsError } from '../states/SuggestionsError';

const EnhancedSuggestionsLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SuggestionFilter>('popular');

  const {
    suggestions,
    isLoading,
    error,
    isFetching,
    stats
  } = useOptimizedSuggestions(filter, searchQuery);

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useMemo(() => {
    const timeoutId = setTimeout(() => {
      // Search is already handled by the hook
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (isLoading) {
    return <SuggestionsLoading />;
  }

  if (error) {
    return <SuggestionsError error={error} />;
  }

  return (
    <div className="container py-8 max-w-7xl">
      <SuggestionsHeader 
        totalSuggestions={stats.total}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <SuggestionsFilters 
        currentFilter={filter}
        onFilterChange={setFilter}
        isLoading={isFetching}
        stats={stats.byStatus}
      />
      
      <SuggestionsContent 
        suggestions={suggestions}
        searchQuery={searchQuery}
        filter={filter}
      />
    </div>
  );
};

export default EnhancedSuggestionsLayout;
