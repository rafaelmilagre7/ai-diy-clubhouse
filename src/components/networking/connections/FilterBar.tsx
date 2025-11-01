import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters?: { key: string; label: string }[];
  onRemoveFilter?: (key: string) => void;
  onClearAll?: () => void;
  placeholder?: string;
}

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  placeholder = "Buscar por nome, empresa ou cargo..."
}: FilterBarProps) => {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-11 bg-surface-elevated border-border/50 focus-visible:ring-aurora"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          className="h-11 w-11 border-border/50 hover:bg-aurora/10 hover:border-aurora/30"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <span className="text-xs text-muted-foreground font-medium">Filtros:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                {filter.label}
                <button
                  onClick={() => onRemoveFilter?.(filter.key)}
                  className="ml-1 hover:bg-destructive/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-6 text-xs text-muted-foreground hover:text-destructive"
            >
              Limpar tudo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
