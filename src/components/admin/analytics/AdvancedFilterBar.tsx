
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface AdvancedFilterBarProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  category?: string;
  onCategoryChange?: (value: string) => void;
  difficulty?: string;
  onDifficultyChange?: (value: string) => void;
  activeFilters?: string[];
  onRemoveFilter?: (filter: string) => void;
  onClearAll?: () => void;
}

const TIME_RANGES: FilterOption[] = [
  { label: 'Últimas 24 horas', value: '24h' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Últimos 90 dias', value: '90d' },
  { label: 'Este ano', value: '1y' },
  { label: 'Todo período', value: 'all' }
];

const CATEGORIES: FilterOption[] = [
  { label: 'Todas as categorias', value: 'all' },
  { label: 'Automação', value: 'automation', count: 12 },
  { label: 'Marketing', value: 'marketing', count: 8 },
  { label: 'Vendas', value: 'sales', count: 15 },
  { label: 'Produtividade', value: 'productivity', count: 20 }
];

const DIFFICULTIES: FilterOption[] = [
  { label: 'Todas as dificuldades', value: 'all' },
  { label: 'Iniciante', value: 'easy', count: 25 },
  { label: 'Intermediário', value: 'medium', count: 18 },
  { label: 'Avançado', value: 'hard', count: 12 }
];

export const AdvancedFilterBar = ({
  timeRange,
  onTimeRangeChange,
  category = 'all',
  onCategoryChange,
  difficulty = 'all',
  onDifficultyChange,
  activeFilters = [],
  onRemoveFilter,
  onClearAll
}: AdvancedFilterBarProps) => {
  const getTimeRangeLabel = () => {
    return TIME_RANGES.find(range => range.value === timeRange)?.label || 'Período personalizado';
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Filtros Principais */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-card-foreground">Filtros:</span>
            </div>

            {/* Time Range */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-select-lg bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {TIME_RANGES.map((range) => (
                    <SelectItem 
                      key={range.value} 
                      value={range.value}
                      className="text-popover-foreground hover:bg-accent"
                    >
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            {onCategoryChange && (
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-select-md bg-background border-border text-foreground">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem 
                      key={cat.value} 
                      value={cat.value}
                      className="text-popover-foreground hover:bg-accent"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{cat.label}</span>
                        {cat.count && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-secondary text-secondary-foreground">
                            {cat.count}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Difficulty Filter */}
            {onDifficultyChange && (
              <Select value={difficulty} onValueChange={onDifficultyChange}>
                <SelectTrigger className="w-select-md bg-background border-border text-foreground">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem 
                      key={diff.value} 
                      value={diff.value}
                      className="text-popover-foreground hover:bg-accent"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{diff.label}</span>
                        {diff.count && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-secondary text-secondary-foreground">
                            {diff.count}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {activeFilters.map((filter) => (
                <Badge 
                  key={filter} 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                >
                  {filter}
                  {onRemoveFilter && (
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-primary/80" 
                      onClick={() => onRemoveFilter(filter)}
                    />
                  )}
                </Badge>
              ))}
              {onClearAll && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearAll}
                  className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Limpar todos
                </Button>
              )}
            </div>
          )}

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Filtros rápidos:</span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => onTimeRangeChange('24h')}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => onTimeRangeChange('7d')}
            >
              Esta semana
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => onTimeRangeChange('30d')}
            >
              Este mês
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
