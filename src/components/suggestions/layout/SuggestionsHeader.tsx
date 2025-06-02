
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Search, TrendingUp, Clock, Settings, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SuggestionFilter } from '@/types/suggestionTypes';

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
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          Melhore a plataforma
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Sugestões da Comunidade
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Compartilhe suas ideias e ajude a tornar nossa plataforma ainda melhor. 
          Sua opinião faz a diferença!
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar sugestões..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          
          {/* Filters */}
          <ToggleGroup 
            type="single" 
            defaultValue={filter} 
            value={filter}
            onValueChange={(value) => value && onFilterChange(value as SuggestionFilter)}
            className="flex-wrap gap-1"
          >
            <ToggleGroupItem 
              value="popular" 
              className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Populares</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="recent" 
              className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Recentes</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="in_development" 
              className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Em Desenvolvimento</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="completed" 
              className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Implementadas</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => navigate('/suggestions/new')}
          size="lg"
          className="gap-2 font-medium whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Nova Sugestão
        </Button>
      </div>
    </div>
  );
};
