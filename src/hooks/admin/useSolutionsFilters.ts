
import { useState, useMemo } from 'react';
import { Solution } from '@/lib/supabase';

export interface SolutionsFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedDifficulty: string;
  selectedStatus: string;
}

export function useSolutionsFilters(solutions: Solution[]) {
  const [filters, setFilters] = useState<SolutionsFilters>({
    searchTerm: '',
    selectedCategory: 'all',
    selectedDifficulty: 'all',
    selectedStatus: 'all'
  });

  const filteredSolutions = useMemo(() => {
    return solutions.filter(solution => {
      const matchesSearch = solution.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                          solution.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesCategory = filters.selectedCategory === 'all' || 
                             solution.category === filters.selectedCategory;
      
      const matchesDifficulty = filters.selectedDifficulty === 'all' || 
                               solution.difficulty === filters.selectedDifficulty;
      
      const matchesStatus = filters.selectedStatus === 'all' ||
                           (filters.selectedStatus === 'published' && solution.published) ||
                           (filters.selectedStatus === 'draft' && !solution.published);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [solutions, filters]);

  const updateFilter = (key: keyof SolutionsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCategory: 'all',
      selectedDifficulty: 'all',
      selectedStatus: 'all'
    });
  };

  return {
    filters,
    filteredSolutions,
    updateFilter,
    resetFilters
  };
}
