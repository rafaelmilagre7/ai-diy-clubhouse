
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Hook super otimizado para carregamento instantâneo de soluções
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

  // Verificar se temos dados em cache antes de qualquer renderização
  const cachedSolutions = queryClient.getQueryData<Solution[]>(['solutions']);

  // Usar React Query para cache ultra agressivo e refetch controlado
  const { 
    data: solutions = cachedSolutions || [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['solutions'],
    queryFn: fetchSolutions,
    staleTime: 10 * 60 * 1000, // 10 minutos de cache - reduz drasticamente fetches
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !cachedSolutions, // Não executar consulta se já tivermos dados em cache
    placeholderData: (previousData) => previousData || cachedSolutions,
  });

  // Prefetch agressivo para detalhes - carrega TODOS os detalhes antes mesmo do clique
  const prefetchAllDetails = useCallback(() => {
    if (solutions) {
      solutions.forEach(solution => {
        queryClient.prefetchQuery({
          queryKey: ['solution', solution.id],
          queryFn: async () => {
            // Se já temos os dados completos, retorne-os imediatamente
            const existingData = queryClient.getQueryData(['solution', solution.id]);
            if (existingData) return existingData;
            
            // Caso contrário, faça o fetch
            const { data } = await supabase
              .from('solutions')
              .select('*')
              .eq('id', solution.id)
              .single();
            return data;
          },
          staleTime: 5 * 60 * 1000, // 5 minutos
        });
      });
    }
  }, [solutions, queryClient]);

  // Carregue os detalhes de todas as soluções logo após obter a lista
  useEffect(() => {
    if (solutions && solutions.length > 0 && !isLoading) {
      prefetchAllDetails();
    }
  }, [solutions, isLoading, prefetchAllDetails]);

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

  return {
    solutions,
    filteredSolutions,
    loading: isLoading && !cachedSolutions, // Usando cache para eliminar sensação de loading
    error: error ? String(error) : null,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    // Navegação otimizada com dados já pré-carregados
    navigateToSolution: (id: string) => {
      navigate(`/solution/${id}`);
    },
    refreshSolutions: refetch
  };
}
