
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Hook simplificado sem cache agressivo ou prefetching
export function useSolutionsData(initialCategory: string | null = 'all') {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');
  const navigate = useNavigate();

  // Implementação simplificada da função de fetching
  const fetchSolutions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
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

  // Consulta simplificada com configurações básicas
  const { 
    data: solutions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['solutions'],
    queryFn: fetchSolutions,
    refetchOnWindowFocus: false
  });

  // Filtrar soluções
  const filteredSolutions = solutions.filter(solution => {
    if (activeCategory !== 'all' && solution.category !== activeCategory) {
      return false;
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return (
        solution.title.toLowerCase().includes(query) || 
        solution.description.toLowerCase().includes(query) ||
        (solution.tags && solution.tags.some(tag => 
          tag.toLowerCase().includes(query)
        ))
      );
    }
    
    return true;
  });

  return {
    solutions,
    filteredSolutions,
    loading: isLoading,
    error: error ? String(error) : null,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    navigateToSolution: (id: string) => {
      navigate(`/solution/${id}`);
    },
    refreshSolutions: refetch
  };
}
