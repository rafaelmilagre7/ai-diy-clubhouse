
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { useCategories } from '@/hooks/suggestions/useCategories';

interface EnhancedSuggestionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: SuggestionFilter;
  onFilterChange: (value: SuggestionFilter) => void;
  selectedCategory: string | null;
  onCategoryChange: (value: string | null) => void;
  selectedStatus: string | null;
  onStatusChange: (value: string | null) => void;
}

export const EnhancedSuggestionFilters: React.FC<EnhancedSuggestionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange
}) => {
  const { categories } = useCategories();

  const statusOptions = [
    { value: 'new', label: 'Nova' },
    { value: 'under_review', label: 'Em Análise' },
    { value: 'in_development', label: 'Em Desenvolvimento' },
    { value: 'completed', label: 'Concluída' },
    { value: 'declined', label: 'Recusada' }
  ];

  const filterLabels = {
    popular: 'Populares',
    recent: 'Recentes',
    in_development: 'Em Desenvolvimento',
    completed: 'Concluídas'
  };

  const hasActiveFilters = selectedCategory || selectedStatus;

  const clearAllFilters = () => {
    onCategoryChange(null);
    onStatusChange(null);
    onSearchChange('');
  };

  return (
    <div className="space-y-4">
      {/* Busca Principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar sugestões..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-4"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filtros em Linha */}
      <div className="flex flex-wrap gap-3">
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Populares</SelectItem>
            <SelectItem value="recent">Recentes</SelectItem>
            <SelectItem value="in_development">Em Desenvolvimento</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={selectedCategory || ''} 
          onValueChange={(value) => onCategoryChange(value || null)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedStatus || ''} 
          onValueChange={(value) => onStatusChange(value || null)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Badges de Filtros Ativos */}
      {(hasActiveFilters || filter !== 'popular' || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          {filter !== 'popular' && (
            <Badge variant="secondary">
              {filterLabels[filter]}
            </Badge>
          )}
          
          {selectedCategory && (
            <Badge variant="secondary">
              Categoria: {categories.find(c => c.id === selectedCategory)?.name}
            </Badge>
          )}
          
          {selectedStatus && (
            <Badge variant="secondary">
              Status: {statusOptions.find(s => s.value === selectedStatus)?.label}
            </Badge>
          )}
          
          {searchQuery && (
            <Badge variant="secondary">
              Busca: "{searchQuery}"
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
