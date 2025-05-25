
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface MemberFiltersProps {
  filters: {
    search: string;
    industry: string;
    role: string;
    onlyAvailableForNetworking: boolean;
  };
  onFiltersChange: (filters: any) => void;
  availableIndustries: string[];
  availableRoles: string[];
}

export const MemberFilters = ({
  filters,
  onFiltersChange,
  availableIndustries,
  availableRoles
}: MemberFiltersProps) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou empresa..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={filters.industry} onValueChange={(value) => updateFilter('industry', value)}>
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="Indústria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas as indústrias</SelectItem>
          {availableIndustries.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
        <SelectTrigger className="w-full lg:w-48">
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
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="networking"
          checked={filters.onlyAvailableForNetworking}
          onCheckedChange={(checked) => updateFilter('onlyAvailableForNetworking', checked)}
        />
        <Label htmlFor="networking" className="text-sm">
          Disponível para networking
        </Label>
      </div>
    </div>
  );
};
