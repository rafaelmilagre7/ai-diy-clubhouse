import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MatchFiltersProps {
  onFiltersChange: (filters: MatchFilters) => void;
  className?: string;
}

export interface MatchFilters {
  types: string[];
  compatibilityRange: [number, number];
  showOnlyUnread: boolean;
}

const MATCH_TYPES = [
  { value: 'customer', label: 'Clientes' },
  { value: 'supplier', label: 'Fornecedores' },
  { value: 'partner', label: 'Parceiros' },
  { value: 'strategic', label: 'Estratégicos' },
  { value: 'ai_generated', label: 'IA Generated' }
];

export const MatchFilters = ({ onFiltersChange, className }: MatchFiltersProps) => {
  const [filters, setFilters] = useState<MatchFilters>({
    types: [],
    compatibilityRange: [0, 100],
    showOnlyUnread: false
  });

  const updateFilters = (newFilters: Partial<MatchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    updateFilters({ types: newTypes });
  };

  const clearFilters = () => {
    const clearedFilters: MatchFilters = {
      types: [],
      compatibilityRange: [0, 100],
      showOnlyUnread: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = filters.types.length + 
    (filters.showOnlyUnread ? 1 : 0) +
    (filters.compatibilityRange[0] > 0 || filters.compatibilityRange[1] < 100 ? 1 : 0);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Tipo de Match</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MATCH_TYPES.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={filters.types.includes(type.value)}
                    onCheckedChange={() => handleTypeToggle(type.value)}
                  >
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.showOnlyUnread}
                  onCheckedChange={(checked) => updateFilters({ showOnlyUnread: checked })}
                >
                  Apenas não lidos
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mostrar filtros ativos */}
            {filters.types.map((type) => {
              const typeLabel = MATCH_TYPES.find(t => t.value === type)?.label || type;
              return (
                <Badge key={type} variant="secondary" className="gap-1">
                  {typeLabel}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4"
                    onClick={() => handleTypeToggle(type)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}

            {filters.showOnlyUnread && (
              <Badge variant="secondary" className="gap-1">
                Não lidos
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4 h-4"
                  onClick={() => updateFilters({ showOnlyUnread: false })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};