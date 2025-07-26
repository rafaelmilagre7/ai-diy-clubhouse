import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { AdminCard } from './AdminCard';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'search' | 'select' | 'date' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

interface AdminFiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
  className?: string;
  compact?: boolean;
  activeFiltersCount?: number;
}

/**
 * Sistema de filtros padrão do admin
 * Suporte a diferentes tipos de filtros com design Aurora
 */
export const AdminFilters = ({
  filters,
  values,
  onChange,
  onReset,
  className,
  compact = false,
  activeFiltersCount = 0
}: AdminFiltersProps) => {
  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'search':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder={filter.placeholder || `Buscar ${filter.label.toLowerCase()}...`}
              value={value || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="pl-10"
            />
          </div>
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => onChange(filter.key, val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Selecionar ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
          />
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(values).some(value => value && value !== '');

  if (compact) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-0 flex-1">
            <label className="text-caption text-text-muted mb-1 block">
              {filter.label}
            </label>
            {renderFilter(filter)}
          </div>
        ))}
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>
    );
  }

  return (
    <AdminCard className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-aurora" />
            <h3 className="text-heading-3">Filtros</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-label text-text-secondary">
                {filter.label}
              </label>
              {renderFilter(filter)}
            </div>
          ))}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="border-t border-border/30 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body-small text-text-secondary">Filtros ativos:</span>
              {Object.entries(values).map(([key, value]) => {
                if (!value || value === '') return null;
                
                const filter = filters.find(f => f.key === key);
                if (!filter) return null;

                const displayValue = filter.type === 'select' 
                  ? filter.options?.find(opt => opt.value === value)?.label || value
                  : value;

                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>{filter.label}: {displayValue}</span>
                    <button
                      onClick={() => onChange(key, '')}
                      className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminCard>
  );
};