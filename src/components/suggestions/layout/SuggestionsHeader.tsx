
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
    <div className="flex flex-col space-y-6">
      {/* Header com título e ação principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sugestões</h1>
          <p className="text-muted-foreground mt-1">
            Compartilhe suas ideias e vote nas propostas da comunidade
          </p>
        </div>
        <Button 
          onClick={() => navigate('/suggestions/new')}
          className="gap-2"
        >
          <Plus size={16} />
          Nova Sugestão
        </Button>
      </div>
      
      {/* Barra de busca */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar sugestões..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Filtros organizados */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Ordenar:</span>
          <ToggleGroup 
            type="single" 
            value={filter}
            onValueChange={(value) => value && onFilterChange(value as SuggestionFilter)}
            className="h-9"
          >
            <ToggleGroupItem value="popular" className="gap-2 px-3">
              <TrendingUp className="h-4 w-4" />
              <span>Populares</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="recent" className="gap-2 px-3">
              <Clock className="h-4 w-4" />
              <span>Recentes</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <ToggleGroup 
            type="single" 
            value={filter}
            onValueChange={(value) => value && onFilterChange(value as SuggestionFilter)}
            className="h-9"
          >
            <ToggleGroupItem value="new" className="gap-2 px-3">
              <Lightbulb className="h-4 w-4" />
              <span>Novas</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="in_development" className="gap-2 px-3">
              <Wrench className="h-4 w-4" />
              <span>Em Desenvolvimento</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="implemented" className="gap-2 px-3">
              <CheckCircle className="h-4 w-4" />
              <span>Implementadas</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};
