
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Hook otimizado para carregamento e cache eficiente de soluções
export function useSolutionsData(initialCategory: string | null = 'all') {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Implementar função de fetching separadamente para melhor controle
  const fetchSolutions = useCallback(async () => {
    try {
      console.log('Fetching solutions from database...');
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Pre-populando o cache para detalhes de solução mais rápidos
      if (data) {
        data.forEach(solution => {
          queryClient.setQueryData(['solution', solution.id], solution);
        });
      }
      
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
  }, [toast, queryClient]);

  // Verificar se temos dados em cache primeiro
  const cachedSolutions = queryClient.getQueryData<Solution[]>(['solutions']);

  // Usar React Query para cache e refetch
  const { data: solutions = [], isLoading, error, isFetched } = useQuery({
    queryKey: ['solutions'],
    queryFn: fetchSolutions,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    refetchOnWindowFocus: false, // Não refetch ao focar a janela
    placeholderData: (previousData) => previousData || cachedSolutions, // Usar dados anteriores como placeholder
  });

  // Prefetch lógica para melhorar carregamento de detalhes
  const prefetchSolutionDetails = useCallback((solutionId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['solution', solutionId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', solutionId)
          .single();
        
        if (error) throw error;
        return data;
      },
      staleTime: 60 * 1000, // 1 minuto
    });
  }, [queryClient]);

  // Filtrar soluções por categoria e pesquisa
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];
    
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

  // Retorna objeto com lógica estendida para navegação e prefetch
  return {
    solutions,
    filteredSolutions,
    loading: isLoading && !cachedSolutions, // Somente loading se não tiver cache
    isFetched,
    error: error ? String(error) : null,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    prefetchSolutionDetails,
    // Método para navegação com prefetch
    navigateToSolution: (id: string) => {
      prefetchSolutionDetails(id);
      navigate(`/solution/${id}`);
    },
    refreshSolutions: fetchSolutions
  };
}
