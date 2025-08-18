import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, X, Users, Building2, TrendingUp, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchFiltersProps {
  onFilterChange: (filters: {
    search: string;
    matchType: string;
    minCompatibility: number;
    sortBy: string;
  }) => void;
  matchesCount: number;
}

export const MatchFilters = ({ onFilterChange, matchesCount }: MatchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    matchType: 'all',
    minCompatibility: 0,
    sortBy: 'compatibility'
  });

  const handleFilterUpdate = (newFilters: typeof filters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      matchType: 'all',
      minCompatibility: 0,
      sortBy: 'compatibility'
    };
    handleFilterUpdate(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.matchType !== 'all' || filters.minCompatibility > 0;

  return (
    <div className="space-y-4">
      {/* Header com busca e botão de filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou setor..."
            value={filters.search}
            onChange={(e) => handleFilterUpdate({ ...filters, search: e.target.value })}
            className="pl-10 bg-background/50 backdrop-blur border-border/50"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{matchesCount} matches</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Filtrado
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </div>
      </div>

      {/* Filtros expandidos */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tipo de Match */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Match</label>
                  <Select
                    value={filters.matchType}
                    onValueChange={(value) => handleFilterUpdate({ ...filters, matchType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="customer">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Potencial Cliente
                        </div>
                      </SelectItem>
                      <SelectItem value="supplier">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Fornecedor
                        </div>
                      </SelectItem>
                      <SelectItem value="partner">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Parceria Estratégica
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Compatibilidade Mínima */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Compatibilidade Mínima: {filters.minCompatibility}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.minCompatibility}
                    onChange={(e) => handleFilterUpdate({ ...filters, minCompatibility: Number(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer 
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                             [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 
                             [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-sm"
                  />
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterUpdate({ ...filters, sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compatibility">Maior Compatibilidade</SelectItem>
                      <SelectItem value="recent">Mais Recentes</SelectItem>
                      <SelectItem value="name">Nome A-Z</SelectItem>
                      <SelectItem value="company">Empresa A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botão limpar filtros */}
              {hasActiveFilters && (
                <div className="flex justify-end pt-2 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};