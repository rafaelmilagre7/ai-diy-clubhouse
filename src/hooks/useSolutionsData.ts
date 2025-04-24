
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

// Otimização: Usar React Query para cache e gerenciamento de estado
export function useSolutionsData(initialCategory: string | null = 'all') {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');

  // Implementar função de fetching separadamente para melhor controle
  const fetchSolutions = useCallback(async () => {
    try {
      console.log('Fetching solutions from database...');
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('published', true)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      return data as Solution[];
    } catch (error: any) {
      console.error('Erro ao buscar soluções:', error);
      toast({
        title: 'Erro ao carregar soluções',
        description: 'Não foi possível carregar as soluções disponíveis.',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  // Usar React Query para cache e refetch
  const { data: solutions = [], isLoading, error } = useQuery({
    queryKey: ['solutions'],
    queryFn: fetchSolutions,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    refetchOnWindowFocus: false, // Não refetch ao focar a janela
  });

  // Filtrar soluções por categoria e pesquisa
  const filteredSolutions = useMemo(() => {
    let filtered = [...solutions];
    
    // Filtrar por categoria
    if (activeCategory !== 'all') {
      filtered = filtered.filter(solution => solution.category === activeCategory);
    }
    
    // Filtrar por pesquisa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(solution => 
        solution.title.toLowerCase().includes(query) || 
        solution.description.toLowerCase().includes(query) ||
        (solution.tags && solution.tags.some(tag => 
          tag.toLowerCase().includes(query)
        ))
      );
    }
    
    return filtered;
  }, [solutions, activeCategory, searchQuery]);

  return {
    solutions,
    filteredSolutions,
    loading: isLoading,
    error: error ? String(error) : null,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory
  };
}
