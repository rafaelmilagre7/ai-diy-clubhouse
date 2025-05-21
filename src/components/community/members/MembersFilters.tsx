
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface MembersFiltersProps {
  onFilterChange: (filters: any) => void;
  industries: string[];
  roles: string[];
  currentFilters: {
    search?: string;
    industry?: string;
    role?: string;
  };
}

export const MembersFilters = ({
  onFilterChange,
  industries,
  roles,
  currentFilters,
}: MembersFiltersProps) => {
  const [searchInput, setSearchInput] = useState(currentFilters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      industry: '',
      role: '',
    });
  };

  const hasFilters = !!(currentFilters.search || currentFilters.industry || currentFilters.role);

  return (
    <div className="bg-background rounded-md border p-4 mb-6 space-y-4">
      <h3 className="text-lg font-medium mb-2">Filtrar membros</h3>
      
      <form onSubmit={handleSearchSubmit} className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Setor</label>
          <Select
            value={currentFilters.industry || ''}
            onValueChange={(value) => onFilterChange({ industry: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todos os setores</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Cargo</label>
          <Select
            value={currentFilters.role || ''}
            onValueChange={(value) => onFilterChange({ role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todos os cargos</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};
