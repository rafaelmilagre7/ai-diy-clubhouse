
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { Loader2, TrendingUp, Clock, Wrench, CheckCircle } from 'lucide-react';

interface SuggestionsFiltersProps {
  currentFilter: SuggestionFilter;
  onFilterChange: (filter: SuggestionFilter) => void;
  isLoading?: boolean;
  stats?: {
    popular: number;
    recent: number;
    in_development: number;
    completed: number;
    all: number;
  };
}

const filterConfig = {
  all: {
    label: 'Todas',
    icon: null,
    description: 'Todas as sugestões'
  },
  popular: {
    label: 'Populares',
    icon: TrendingUp,
    description: 'Mais votadas'
  },
  recent: {
    label: 'Recentes',
    icon: Clock,
    description: 'Adicionadas recentemente'
  },
  in_development: {
    label: 'Em Desenvolvimento',
    icon: Wrench,
    description: 'Sendo implementadas'
  },
  completed: {
    label: 'Concluídas',
    icon: CheckCircle,
    description: 'Já implementadas'
  }
};

export const SuggestionsFilters: React.FC<SuggestionsFiltersProps> = ({
  currentFilter,
  onFilterChange,
  isLoading = false,
  stats = { popular: 0, recent: 0, in_development: 0, completed: 0, all: 0 }
}) => {
  return (
    <div className="bg-card border rounded-lg p-6 mb-8">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.keys(filterConfig) as SuggestionFilter[]).map((filter) => {
            const config = filterConfig[filter];
            const Icon = config.icon;
            const count = stats[filter as keyof typeof stats] || 0;
            const isActive = currentFilter === filter;
            
            return (
              <Button
                key={filter}
                variant={isActive ? "default" : "outline"}
                className={`
                  flex flex-col items-center gap-2 p-4 h-auto transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'hover:bg-muted hover:scale-102 hover:shadow-sm'
                  }
                `}
                onClick={() => onFilterChange(filter)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="font-medium text-sm">{config.label}</span>
                </div>
                
                <Badge 
                  variant={isActive ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {count}
                </Badge>
                
                <span className="text-xs text-muted-foreground text-center leading-tight">
                  {config.description}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
