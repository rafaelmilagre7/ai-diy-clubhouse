
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Search, TrendingUp, Clock, Lightbulb, Wrench, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SuggestionFilter } from '@/hooks/suggestions/useSuggestions';

interface SuggestionsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: SuggestionFilter;
  onFilterChange: (value: SuggestionFilter) => void;
}

export const SuggestionsHeader: React.FC<SuggestionsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sugestões</h1>
        <Button 
          onClick={() => navigate('/suggestions/new')}
          className="gap-2"
        >
          <Plus size={16} />
          Nova Sugestão
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar sugestões..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          {/* Filtros gerais */}
          <ToggleGroup 
            type="single" 
            value={filter}
            onValueChange={(value) => value && onFilterChange(value as SuggestionFilter)}
            className="justify-start"
          >
            <ToggleGroupItem value="popular" className="gap-1 whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Populares</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="recent" className="gap-1 whitespace-nowrap">
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline">Recentes</span>
            </ToggleGroupItem>
          </ToggleGroup>
          
          {/* Filtros por status */}
          <ToggleGroup 
            type="single" 
            value={filter}
            onValueChange={(value) => value && onFilterChange(value as SuggestionFilter)}
            className="justify-start"
          >
            <ToggleGroupItem value="new" className="gap-1 whitespace-nowrap">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden md:inline">Novas</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="in_development" className="gap-1 whitespace-nowrap">
              <Wrench className="h-4 w-4" />
              <span className="hidden md:inline">Em Desenvolvimento</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="implemented" className="gap-1 whitespace-nowrap">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden md:inline">Implementadas</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};
