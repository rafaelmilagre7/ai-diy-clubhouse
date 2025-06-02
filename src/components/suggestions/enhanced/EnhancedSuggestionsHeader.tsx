
import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { useNavigate } from 'react-router-dom';

interface EnhancedSuggestionsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: SuggestionFilter;
  onFilterChange: (value: SuggestionFilter) => void;
}

export const EnhancedSuggestionsHeader: React.FC<EnhancedSuggestionsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange
}) => {
  const navigate = useNavigate();

  const filterLabels = {
    popular: 'Populares',
    recent: 'Recentes',
    in_development: 'Em Desenvolvimento',
    completed: 'Concluídas'
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Sugestões da Comunidade
          </h1>
          <p className="text-muted-foreground mt-1">
            Compartilhe ideias e vote nas melhores sugestões para a plataforma
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/suggestions/new')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Sugestão
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar sugestões..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Populares</SelectItem>
            <SelectItem value="recent">Recentes</SelectItem>
            <SelectItem value="in_development">Em Desenvolvimento</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Badge do filtro ativo */}
      {filter !== 'popular' && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary">
            {filterLabels[filter]}
          </Badge>
        </div>
      )}
    </div>
  );
};
