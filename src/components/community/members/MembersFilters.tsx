
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CommunityMemberFilters } from '@/hooks/community/useCommunityMembers';

interface MembersFiltersProps {
  onFilterChange: (filters: CommunityMemberFilters) => void;
  industries: string[];
  roles: string[];
  currentFilters: CommunityMemberFilters;
}

export const MembersFilters = ({
  onFilterChange,
  industries,
  roles,
  currentFilters
}: MembersFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<CommunityMemberFilters>(currentFilters);

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = { search: '', industry: '', role: '', onlyAvailableForNetworking: false };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            placeholder="Nome ou empresa..."
            value={localFilters.search || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
          />
        </div>

        <div>
          <Label>Setor</Label>
          <Select
            value={localFilters.industry || ''}
            onValueChange={(value) => setLocalFilters({ ...localFilters, industry: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o setor" />
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
        </div>

        <div>
          <Label>Cargo</Label>
          <Select
            value={localFilters.role || ''}
            onValueChange={(value) => setLocalFilters({ ...localFilters, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cargo" />
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
        </div>

        <div className="flex flex-col justify-end">
          <div className="flex items-center space-x-2">
            <Switch
              id="networking"
              checked={localFilters.onlyAvailableForNetworking || false}
              onCheckedChange={(checked) => 
                setLocalFilters({ ...localFilters, onlyAvailableForNetworking: checked })
              }
            />
            <Label htmlFor="networking">Disponível para networking</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters}>
          Aplicar Filtros
        </Button>
        <Button variant="outline" onClick={handleClearFilters}>
          Limpar
        </Button>
      </div>
    </div>
  );
};
