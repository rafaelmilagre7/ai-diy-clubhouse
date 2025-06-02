
import React from 'react';
import { SuggestionCard } from '../cards/SuggestionCard';
import { SuggestionsEmptyState } from '../states/SuggestionsEmptyState';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { Suggestion, SuggestionFilter } from '@/types/suggestionTypes';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Settings, CheckCircle, List } from 'lucide-react';

interface SuggestionsContentProps {
  suggestions: Suggestion[];
  searchQuery: string;
  filter?: SuggestionFilter;
}

const getFilterIcon = (filter: SuggestionFilter) => {
  switch (filter) {
    case 'popular':
      return TrendingUp;
    case 'recent':
      return Clock;
    case 'in_development':
      return Settings;
    case 'completed':
      return CheckCircle;
    default:
      return List;
  }
};

const getFilterLabel = (filter: SuggestionFilter) => {
  switch (filter) {
    case 'popular':
      return 'Populares';
    case 'recent':
      return 'Recentes';
    case 'in_development':
      return 'Em Desenvolvimento';
    case 'completed':
      return 'Implementadas';
    default:
      return 'Todas';
  }
};

export const SuggestionsContent: React.FC<SuggestionsContentProps> = ({ 
  suggestions, 
  searchQuery,
  filter = 'popular'
}) => {
  const FilterIcon = getFilterIcon(filter);
  const filterLabel = getFilterLabel(filter);
  
  // Estatísticas por status
  const statusStats = suggestions.reduce((acc, suggestion) => {
    acc[suggestion.status] = (acc[suggestion.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (suggestions.length === 0) {
    return <SuggestionsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-card/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <FilterIcon className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">
              {filterLabel}
            </h2>
            <p className="text-sm text-muted-foreground">
              {suggestions.length} {suggestions.length === 1 ? 'sugestão' : 'sugestões'} 
              {searchQuery && ` para "${searchQuery}"`}
            </p>
          </div>
        </div>
        
        {Object.keys(statusStats).length > 1 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusStats).map(([status, count]) => (
              <Badge key={status} variant="secondary" className="text-xs">
                {getStatusLabel(status)}: {count}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Grid de sugestões com animação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.id}
            className="animate-fade-in"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <SuggestionCard
              suggestion={suggestion}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
            />
          </div>
        ))}
      </div>

      {/* Indicador de final da lista */}
      {suggestions.length > 6 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {suggestions.length} {suggestions.length === 1 ? 'sugestão' : 'sugestões'}
          </p>
        </div>
      )}
    </div>
  );
};
