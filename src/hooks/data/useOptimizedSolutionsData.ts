
import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';

interface UseOptimizedSolutionsDataProps {
  initialCategory?: string | null;
  searchQuery?: string;
}

/**
 * Hook otimizado para dados de soluções com fallbacks robustos
 */
export const useOptimizedSolutionsData = ({
  initialCategory = 'all',
  searchQuery = ''
}: UseOptimizedSolutionsDataProps = {}) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  console.log('useOptimizedSolutionsData: Iniciando', { isAdmin, hasProfile: !!profile });

  // Fetch solutions com configuração ultra-resiliente
  const { 
    data: solutions = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['solutions', isAdmin],
    queryFn: async () => {
      console.log('useOptimizedSolutionsData: Executando query');
      
      try {
        let query = supabase.from("solutions").select("*");
        if (!isAdmin) {
          query = query.eq("published", true);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('useOptimizedSolutionsData: Erro na query:', error);
          throw error;
        }
        
        console.log('useOptimizedSolutionsData: Dados carregados:', data?.length || 0);
        return data as Solution[] || [];
      } catch (err) {
        console.error('useOptimizedSolutionsData: Erro capturado:', err);
        // Retornar array vazio em caso de erro para não quebrar a UI
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // Só tentar 1 vez para não travar
      if (failureCount >= 1) return false;
      // Não tentar novamente para erros de auth
      if (error?.code === 'PGRST116' || error?.code === 'PGRST301') return false;
      return true;
    },
    refetchOnWindowFocus: false,
    enabled: true // Sempre habilitado
  });

  // Filtrar soluções de forma otimizada com fallbacks
  const filteredSolutions = useMemo(() => {
    if (!Array.isArray(solutions) || solutions.length === 0) {
      console.log('useOptimizedSolutionsData: Sem soluções para filtrar');
      return [];
    }
    
    try {
      let filtered = [...solutions];
      
      // Filtrar por categoria
      if (initialCategory && initialCategory !== 'all') {
        filtered = filtered.filter(solution => 
          solution?.category === initialCategory
        );
      }
      
      // Filtrar por pesquisa
      if (searchQuery?.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(solution => 
          solution?.title?.toLowerCase()?.includes(query) || 
          solution?.description?.toLowerCase()?.includes(query) ||
          (solution?.tags && Array.isArray(solution.tags) && solution.tags.some(tag => 
            typeof tag === 'string' && tag.toLowerCase().includes(query)
          ))
        );
      }
      
      console.log('useOptimizedSolutionsData: Soluções filtradas:', filtered.length);
      return filtered;
    } catch (err) {
      console.error('useOptimizedSolutionsData: Erro ao filtrar:', err);
      return solutions || [];
    }
  }, [solutions, initialCategory, searchQuery]);

  return {
    solutions: Array.isArray(solutions) ? solutions : [],
    filteredSolutions: Array.isArray(filteredSolutions) ? filteredSolutions : [],
    loading: isLoading,
    error: error ? String(error) : null,
    canViewSolutions: true,
    hasData: Array.isArray(solutions) && solutions.length > 0
  };
};
