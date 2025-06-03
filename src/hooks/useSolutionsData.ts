
import { useOptimizedQuery } from "@/hooks/common/useOptimizedQuery";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

/**
 * Hook para buscar dados de soluções de forma otimizada
 */
export const useSolutionsData = () => {
  const { profile, isAdmin } = useOptimizedAuth();
  
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
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Solution[];
    },
    enabled: !!profile // Só busca quando tem profile
  });

  return {
    solutions,
    loading,
    error
  };
};
