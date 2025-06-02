
import React from 'react';
import { SuggestionCard } from '../cards/SuggestionCard';
import { SuggestionsEmptyState } from '../states/SuggestionsEmptyState';
import { SuggestionFilter, Suggestion } from '@/types/suggestionTypes';

interface SuggestionsContentProps {
  suggestions: Suggestion[];
  searchQuery: string;
  filter: SuggestionFilter;
}

export const SuggestionsContent: React.FC<SuggestionsContentProps> = ({
  suggestions,
  searchQuery,
  filter
}) => {
  if (suggestions.length === 0) {
    return <SuggestionsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho dos resultados */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {searchQuery ? (
            <>Encontradas <span className="font-semibold text-foreground">{suggestions.length}</span> sugestões para "{searchQuery}"</>
          ) : (
            <>Mostrando <span className="font-semibold text-foreground">{suggestions.length}</span> sugestões</>
          )}
        </div>
      </div>

      {/* Grid de sugestões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
};
