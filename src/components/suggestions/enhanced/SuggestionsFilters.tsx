
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { TrendingUp, Clock, Settings, CheckCircle, List, Loader2 } from 'lucide-react';

interface SuggestionsFiltersProps {
  currentFilter: SuggestionFilter;
  onFilterChange: (filter: SuggestionFilter) => void;
  isLoading?: boolean;
  stats: Record<string, number>;
}

const filterConfig = {
  all: { label: 'Todas', icon: List, description: 'Todas as sugestões' },
  popular: { label: 'Populares', icon: TrendingUp, description: 'Mais votadas' },
  recent: { label: 'Recentes', icon: Clock, description: 'Adicionadas recentemente' },
  in_development: { label: 'Em Desenvolvimento', icon: Settings, description: 'Sendo implementadas' },
  completed: { label: 'Implementadas', icon: CheckCircle, description: 'Já concluídas' }
} as const;

export const SuggestionsFilters: React.FC<SuggestionsFiltersProps> = ({
  currentFilter,
  onFilterChange,
  isLoading = false,
  stats
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(filterConfig).map(([key, config]) => {
          const filterKey = key as SuggestionFilter;
          const Icon = config.icon;
          const count = stats[key] || 0;
          const isActive = currentFilter === filterKey;
          
          return (
            <Button
              key={key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(filterKey)}
              className="gap-2 relative"
              disabled={isLoading}
            >
              {isLoading && isActive ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {config.label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Active filter description */}
      <div className="text-center mt-3">
        <p className="text-sm text-muted-foreground">
          {filterConfig[currentFilter].description}
        </p>
      </div>
    </div>
  );
};
