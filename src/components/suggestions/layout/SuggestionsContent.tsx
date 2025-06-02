
import React from 'react';
import { SuggestionCard } from '../cards/SuggestionCard';
import { SuggestionsEmptyState } from '../states/SuggestionsEmptyState';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { Suggestion, SuggestionFilter } from '@/types/suggestionTypes';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Settings, CheckCircle, List, BarChart3 } from 'lucide-react';

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
      return 'Sugestões Populares';
    case 'recent':
      return 'Sugestões Recentes';
    case 'in_development':
      return 'Em Desenvolvimento';
    case 'completed':
      return 'Implementadas';
    default:
      return 'Todas as Sugestões';
  }
};

const getFilterDescription = (filter: SuggestionFilter, count: number) => {
  switch (filter) {
    case 'popular':
      return `${count} ${count === 1 ? 'sugestão' : 'sugestões'} mais votadas pela comunidade`;
    case 'recent':
      return `${count} ${count === 1 ? 'sugestão recente' : 'sugestões recentes'}`;
    case 'in_development':
      return `${count} ${count === 1 ? 'sugestão sendo' : 'sugestões sendo'} desenvolvida${count === 1 ? '' : 's'}`;
    case 'completed':
      return `${count} ${count === 1 ? 'sugestão implementada' : 'sugestões implementadas'}`;
    default:
      return `${count} ${count === 1 ? 'sugestão' : 'sugestões'} encontradas`;
  }
};

export const SuggestionsContent: React.FC<SuggestionsContentProps> = ({ 
  suggestions, 
  searchQuery,
  filter = 'popular'
}) => {
  const FilterIcon = getFilterIcon(filter);
  const filterLabel = getFilterLabel(filter);
  const filterDescription = getFilterDescription(filter, suggestions.length);
  
  // Estatísticas por status
  const statusStats = suggestions.reduce((acc, suggestion) => {
    acc[suggestion.status] = (acc[suggestion.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (suggestions.length === 0) {
    return <SuggestionsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="bg-card/50 border rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <FilterIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-1">
                {filterLabel}
              </h2>
              <p className="text-muted-foreground">
                {filterDescription}
                {searchQuery && ` para "${searchQuery}"`}
              </p>
            </div>
          </div>
          
          {/* Statistics */}
          {Object.keys(statusStats).length > 1 && (
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusStats).map(([status, count]) => (
                  <Badge key={status} variant="outline" className="text-xs">
                    {getStatusLabel(status)}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.id}
            className="animate-fade-in"
            style={{ 
              animationDelay: `${index * 50}ms`,
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

      {/* Results Footer */}
      {suggestions.length > 9 && (
        <div className="text-center py-6 border-t">
          <p className="text-muted-foreground">
            Mostrando {suggestions.length} {suggestions.length === 1 ? 'sugestão' : 'sugestões'}
          </p>
        </div>
      )}
    </div>
  );
};
