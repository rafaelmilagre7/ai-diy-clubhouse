
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
 * Hook otimizado para dados de soluções
 * Remove lógica desnecessária e melhora cache
 */
export const useOptimizedSolutionsData = ({
  initialCategory = 'all',
  searchQuery = ''
}: UseOptimizedSolutionsDataProps = {}) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  console.log('useOptimizedSolutionsData: Iniciando fetch', { isAdmin, profile: !!profile });

  // Fetch solutions com configuração otimizada
  const { 
    data: solutions = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['solutions', isAdmin],
    queryFn: async () => {
      console.log('useOptimizedSolutionsData: Executando query');
      
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
      return data as Solution[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: true // Sempre habilitado, não depende de profile
  });

  // Filtrar soluções de forma otimizada
  const filteredSolutions = useMemo(() => {
    if (!solutions?.length) {
      console.log('useOptimizedSolutionsData: Sem soluções para filtrar');
      return [];
    }
    
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
    
    console.log('useOptimizedSolutionsData: Soluções filtradas:', filtered.length);
    return filtered;
  }, [solutions, initialCategory, searchQuery]);

  return {
    solutions: solutions || [],
    filteredSolutions,
    loading: isLoading,
    error: error ? String(error) : null,
    canViewSolutions: true // Sempre true para simplificar
  };
};
