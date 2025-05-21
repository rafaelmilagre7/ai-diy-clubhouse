
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface MembersFiltersProps {
  onFilterChange: (filters: { search?: string; industry?: string; role?: string }) => void;
  industries: string[];
  roles: string[];
  currentFilters: { search?: string; industry?: string; role?: string };
}

export const MembersFilters = ({ 
  onFilterChange, 
  industries, 
  roles, 
  currentFilters 
}: MembersFiltersProps) => {
  const [search, setSearch] = useState(currentFilters.search || '');
  
  const handleSearch = () => {
    onFilterChange({ search });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    onFilterChange({ search: '', industry: undefined, role: undefined });
  };

  const hasActiveFilters = !!(currentFilters.search || currentFilters.industry || currentFilters.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-8"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Select 
          value={currentFilters.industry} 
          onValueChange={(value) => onFilterChange({ industry: value || undefined })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os setores</SelectItem>
            {industries.map(industry => (
              <SelectItem key={industry} value={industry}>{industry}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={currentFilters.role} 
          onValueChange={(value) => onFilterChange({ role: value || undefined })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os cargos</SelectItem>
            {roles.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters} className="shrink-0">
            <X className="h-4 w-4 mr-1" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
};
