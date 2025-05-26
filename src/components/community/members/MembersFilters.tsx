
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { MembersFilters as MembersFiltersType } from '@/hooks/community/useCommunityMembers';

interface MembersFiltersProps {
  filters: MembersFiltersType;
  availableIndustries: string[];
  availableRoles: string[];
  onFilterChange: (filters: Partial<MembersFiltersType>) => void;
}

export const MembersFilters: React.FC<MembersFiltersProps> = ({
  filters,
  availableIndustries,
  availableRoles,
  onFilterChange
}) => {
  const hasActiveFilters = filters.search || filters.industry || filters.role || filters.availability;

  const clearFilters = () => {
    onFilterChange({
      search: '',
      industry: '',
      role: '',
      availability: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Busca principal */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, empresa ou cargo..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filtros avançados */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtros:</span>
        </div>

        {/* Setor */}
        <Select
          value={filters.industry}
          onValueChange={(value) => onFilterChange({ industry: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os setores</SelectItem>
            {availableIndustries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Cargo */}
        <Select
          value={filters.role}
          onValueChange={(value) => onFilterChange({ role: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os cargos</SelectItem>
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Disponibilidade */}
        <Select
          value={filters.availability}
          onValueChange={(value) => onFilterChange({ availability: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Disponibilidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="available">Disponível para networking</SelectItem>
            <SelectItem value="busy">Ocupado</SelectItem>
          </SelectContent>
        </Select>

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
};
