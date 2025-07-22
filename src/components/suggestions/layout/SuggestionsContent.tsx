
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <SuggestionCard
            suggestion={suggestion}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
          />
        </div>
      ))}
    </div>
  );
};
