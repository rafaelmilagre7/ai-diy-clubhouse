
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
    <div className="space-y-8">
      {/* Header moderno VIA Aurora Style */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Sugestões</h1>
          <p className="text-base text-muted-foreground">
            Compartilhe suas ideias e vote nas propostas da comunidade
          </p>
        </div>
        <Button 
          onClick={() => navigate('/suggestions/new')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-11 rounded-lg"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Sugestão
        </Button>
      </div>
      
      {/* Container de busca e filtros */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
        {/* Barra de busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar sugestões..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 bg-background border-border focus:border-primary transition-colors"
          />
        </div>

        {/* Filtros organizados */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Ordenar:</span>
            <ToggleGroup 
              type="single" 
              value={filter}
              onValueChange={(value) => value && onFilterChange(value as SuggestionFilter)}
              className="bg-muted/50 p-1 rounded-lg"
            >
              <ToggleGroupItem 
                value="popular" 
                className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9 px-3 rounded-md"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Populares
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="recent" 
                className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9 px-3 rounded-md"
              >
                <Clock className="w-4 h-4 mr-2" />
                Recentes
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Status:</span>
            <ToggleGroup 
              type="single" 
              value={filter}
              onValueChange={(value) => value && onFilterChange(value as SuggestionFilter)}
              className="bg-muted/50 p-1 rounded-lg"
            >
              <ToggleGroupItem 
                value="new" 
                className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9 px-3 rounded-md"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Novas
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="in_development" 
                className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9 px-3 rounded-md"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Desenvolvimento
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="implemented" 
                className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9 px-3 rounded-md"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Implementadas
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
};
