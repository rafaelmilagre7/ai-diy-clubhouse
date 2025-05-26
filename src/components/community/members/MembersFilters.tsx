
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

export interface MembersFiltersState {
  search: string;
  industry: string;
  role: string;
  availability: string;
}

interface MembersFiltersProps {
  onFilterChange: (filters: Partial<MembersFiltersState>) => void;
  industries: string[];
  roles: string[];
  currentFilters: MembersFiltersState;
}

export const MembersFilters: React.FC<MembersFiltersProps> = ({
  onFilterChange,
  industries,
  roles,
  currentFilters
}) => {
  const hasActiveFilters = currentFilters.search || currentFilters.industry || 
                          currentFilters.role || currentFilters.availability;

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
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou habilidades..."
            value={currentFilters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <Select 
            value={currentFilters.industry} 
            onValueChange={(value) => onFilterChange({ industry: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os setores</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={currentFilters.role} 
            onValueChange={(value) => onFilterChange({ role: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os cargos</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={currentFilters.availability} 
            onValueChange={(value) => onFilterChange({ availability: value })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Qualquer</SelectItem>
              <SelectItem value="available">Disponível para networking</SelectItem>
              <SelectItem value="busy">Ocupado</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.search && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Busca: "{currentFilters.search}"
              <button 
                onClick={() => onFilterChange({ search: '' })}
                className="hover:bg-primary/20 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {currentFilters.industry && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Setor: {currentFilters.industry}
              <button 
                onClick={() => onFilterChange({ industry: '' })}
                className="hover:bg-primary/20 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {currentFilters.role && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Cargo: {currentFilters.role}
              <button 
                onClick={() => onFilterChange({ role: '' })}
                className="hover:bg-primary/20 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {currentFilters.availability && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Disponibilidade: {currentFilters.availability === 'available' ? 'Disponível' : 'Ocupado'}
              <button 
                onClick={() => onFilterChange({ availability: '' })}
                className="hover:bg-primary/20 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
