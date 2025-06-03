
import { useMemo } from 'react';
import { useOptimizedAuth } from '@/hooks/auth/useOptimizedAuth';
import { useOptimizedQuery } from '@/hooks/common/useOptimizedQuery';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';

interface UseOptimizedSolutionsDataProps {
  initialCategory?: string | null;
  searchQuery?: string;
}

/**
 * Hook otimizado para dados de soluções
 * Remove lógica desnecessária e melhora cache
 */
export const useOptimizedSolutionsData = ({
  initialCategory = 'all',
  searchQuery = ''
}: UseOptimizedSolutionsDataProps = {}) => {
  const { isAdmin, isAuthenticated } = useOptimizedAuth();

  // Fetch solutions com cache otimizado
  const { 
    data: solutions = [], 
    isLoading, 
    error 
  } = useOptimizedQuery({
    queryKey: ['solutions', 'published'],
    queryFn: async () => {
      // Para membros, apenas soluções publicadas
      // Para admins, todas as soluções (para teste)
      let query = supabase.from("solutions").select("*");
      
      if (!isAdmin) {
        query = query.eq("published", true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error("Erro ao buscar soluções:", error);
        throw error;
      }
      
      console.log("Soluções carregadas:", data?.length || 0);
      return data as Solution[];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 3
  });

  // Filtrar soluções de forma otimizada
  const filteredSolutions = useMemo(() => {
    let filtered = [...solutions];
    
    // Filtrar por categoria
    if (initialCategory && initialCategory !== 'all') {
      filtered = filtered.filter(solution => solution.category === initialCategory);
    }
    
    // Filtrar por pesquisa
    if (searchQuery?.trim()) {
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
  }, [solutions, initialCategory, searchQuery]);

  return {
    solutions,
    filteredSolutions,
    loading: isLoading,
    error: error ? String(error) : null,
    canViewSolutions: isAuthenticated
  };
};
