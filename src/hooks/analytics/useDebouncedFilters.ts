
import { useState, useEffect, useCallback, useMemo } from 'react';

interface FilterState {
  timeRange: string;
  category: string;
  difficulty: string;
  searchTerm: string;
}

interface DebouncedFiltersOptions {
  delay?: number;
  immediate?: boolean;
}

export const useDebouncedFilters = (
  initialFilters: Partial<FilterState> = {},
  options: DebouncedFiltersOptions = {}
) => {
  const { delay = 300, immediate = false } = options;
  
  const [filters, setFilters] = useState<FilterState>({
    timeRange: '30d',
    category: 'all',
    difficulty: 'all',
    searchTerm: '',
    ...initialFilters
  });
  
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce effect
  useEffect(() => {
    if (immediate && JSON.stringify(filters) === JSON.stringify(debouncedFilters)) {
      return;
    }

    setIsDebouncing(true);
    
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [filters, delay, immediate, debouncedFilters]);

  // Memoized update functions
  const updateTimeRange = useCallback((timeRange: string) => {
    setFilters(prev => ({ ...prev, timeRange }));
  }, []);

  const updateCategory = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const updateDifficulty = useCallback((difficulty: string) => {
    setFilters(prev => ({ ...prev, difficulty }));
  }, []);

  const updateSearchTerm = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      timeRange: '30d',
      category: 'all',
      difficulty: 'all',
      searchTerm: ''
    };
    setFilters(defaultFilters);
  }, []);

  const updateMultipleFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoized filter hash for cache keys
  const filterHash = useMemo(() => {
    return `${debouncedFilters.timeRange}-${debouncedFilters.category}-${debouncedFilters.difficulty}-${debouncedFilters.searchTerm}`;
  }, [debouncedFilters]);

  return {
    filters,
    debouncedFilters,
    isDebouncing,
    filterHash,
    updateTimeRange,
    updateCategory,
    updateDifficulty,
    updateSearchTerm,
    updateMultipleFilters,
    resetFilters
  };
};
