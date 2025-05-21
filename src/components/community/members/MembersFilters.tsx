
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
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { CommunityMemberFilters } from '@/hooks/community/useCommunityMembers';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  currentFilters,
}: MembersFiltersProps) => {
  const [searchInput, setSearchInput] = useState(currentFilters.search || '');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...currentFilters, search: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      industry: '',
      role: '',
      onlyAvailableForNetworking: false,
    });
  };

  const hasFilters = !!(
    currentFilters.search || 
    currentFilters.industry || 
    currentFilters.role || 
    currentFilters.onlyAvailableForNetworking
  );

  const applyFilters = (newFilters: Partial<CommunityMemberFilters>) => {
    onFilterChange({
      ...currentFilters,
      ...newFilters
    });
    setIsOpen(false);
  };

  return (
    <div className="bg-background rounded-md border p-4 mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filtrar membros</h3>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Filtre membros por setor, cargo e outras características
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-industry">Setor</Label>
                <Select
                  value={currentFilters.industry || ''}
                  onValueChange={(value) => applyFilters({ industry: value })}
                >
                  <SelectTrigger id="mobile-industry">
                    <SelectValue placeholder="Todos os setores" />
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
              
              <div className="space-y-2">
                <Label htmlFor="mobile-role">Cargo</Label>
                <Select
                  value={currentFilters.role || ''}
                  onValueChange={(value) => applyFilters({ role: value })}
                >
                  <SelectTrigger id="mobile-role">
                    <SelectValue placeholder="Todos os cargos" />
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
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="mobile-networking" 
                  checked={currentFilters.onlyAvailableForNetworking || false}
                  onCheckedChange={(checked) => 
                    applyFilters({ onlyAvailableForNetworking: checked })
                  }
                />
                <Label htmlFor="mobile-networking">Abertos para networking</Label>
              </div>
            </div>
            
            <SheetFooter>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
              <Button onClick={() => setIsOpen(false)}>Aplicar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Setor</label>
          <Select
            value={currentFilters.industry || ''}
            onValueChange={(value) => onFilterChange({ ...currentFilters, industry: value })}
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
            onValueChange={(value) => onFilterChange({ ...currentFilters, role: value })}
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
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="networking" 
            checked={currentFilters.onlyAvailableForNetworking || false}
            onCheckedChange={(checked) => 
              onFilterChange({ ...currentFilters, onlyAvailableForNetworking: checked })
            }
          />
          <Label htmlFor="networking">Abertos para networking</Label>
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
