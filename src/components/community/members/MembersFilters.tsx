
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface MembersFiltersProps {
  onFilterChange: (filters: any) => void;
  industries: string[];
  roles: string[];
  currentFilters: any;
}

export const MembersFilters = ({
  onFilterChange,
  industries,
  roles,
  currentFilters
}: MembersFiltersProps) => {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...currentFilters, search: value });
  };

  const handleIndustryChange = (value: string) => {
    onFilterChange({ ...currentFilters, industry: value === 'all' ? '' : value });
  };

  const handleRoleChange = (value: string) => {
    onFilterChange({ ...currentFilters, role: value === 'all' ? '' : value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      industry: '',
      role: '',
      onlyAvailableForNetworking: false
    });
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            value={currentFilters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={currentFilters.industry || 'all'} onValueChange={handleIndustryChange}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Indústria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as indústrias</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={currentFilters.role || 'all'} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>
    </div>
  );
};
