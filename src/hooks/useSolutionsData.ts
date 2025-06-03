
import { useMemo } from 'react';
import { useOptimizedQuery } from "@/hooks/common/useOptimizedQuery";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

interface UseSolutionsDataProps {
  initialCategory?: string;
  searchQuery?: string;
}

/**
 * Hook para buscar dados de soluções de forma otimizada
 */
export const useSolutionsData = (props: UseSolutionsDataProps = {}) => {
  const { initialCategory = 'all', searchQuery = '' } = props;
  const { profile, isAdmin, isAuthenticated } = useOptimizedAuth();
  
  const { 
    data: solutions = [], 
    isLoading: loading, 
    error 
  } = useOptimizedQuery({
    queryKey: ['solutions', isAdmin],
    queryFn: async () => {
      let query = supabase.from("solutions").select("*");
      if (!isAdmin) {
        query = query.eq("published", true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Solution[];
    },
    enabled: !!profile // Só busca quando tem profile
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
    loading,
    error: error ? String(error) : null,
    canViewSolutions: isAuthenticated
  };
};
