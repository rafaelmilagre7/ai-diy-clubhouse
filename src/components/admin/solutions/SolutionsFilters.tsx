
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import { ALL_CATEGORIES } from "@/lib/types/categoryTypes";
import { SolutionsFilters as FiltersType } from "@/hooks/admin/useSolutionsFilters";

interface SolutionsFiltersProps {
  filters: FiltersType;
  onFilterChange: (key: keyof FiltersType, value: string) => void;
  onResetFilters: () => void;
}

export const SolutionsFilters: React.FC<SolutionsFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar soluções..."
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={filters.selectedCategory} onValueChange={(value) => onFilterChange('selectedCategory', value)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {ALL_CATEGORIES.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.selectedDifficulty} onValueChange={(value) => onFilterChange('selectedDifficulty', value)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Dificuldade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="easy">Fácil</SelectItem>
          <SelectItem value="medium">Médio</SelectItem>
          <SelectItem value="advanced">Avançado</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.selectedStatus} onValueChange={(value) => onFilterChange('selectedStatus', value)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="published">Publicadas</SelectItem>
          <SelectItem value="draft">Rascunhos</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={onResetFilters}
        className="w-full sm:w-auto"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Limpar
      </Button>
    </div>
  );
};
