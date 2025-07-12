
import React from 'react';
import { SuggestionCard } from '../cards/SuggestionCard';
import { SuggestionsEmptyState } from '../states/SuggestionsEmptyState';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { Suggestion } from '@/types/suggestionTypes';

interface SuggestionsContentProps {
  suggestions: Suggestion[];
  searchQuery: string;
}

export const SuggestionsContent: React.FC<SuggestionsContentProps> = ({ 
  suggestions, 
  searchQuery 
}) => {
  if (suggestions.length === 0) {
    return <SuggestionsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {suggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
      ))}
    </div>
  );
};
