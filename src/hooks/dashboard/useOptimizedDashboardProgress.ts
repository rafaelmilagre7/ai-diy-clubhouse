
import { useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { useOptimizedQuery } from "@/hooks/common/useOptimizedQuery";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

/**
 * Hook otimizado para progresso do dashboard
 * Melhora performance e remove logs desnecessários
 */
export const useOptimizedDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  // Fetch progress com cache otimizado
  const { 
    data: progressData,
    isLoading,
    error
  } = useOptimizedQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && solutions.length > 0
  });

  // Processar dados de forma otimizada
  const { active, completed, recommended } = useMemo(() => {
    if (!solutions.length || !progressData) {
      return { active: [], completed: [], recommended: [] };
    }

    // Soluções ativas (em progresso)
    const activeSolutions = solutions.filter(solution => 
      progressData.some(
        progress => 
          progress.solution_id === solution.id && 
          !progress.is_completed
      )
    );

    // Soluções completas
    const completedSolutions = solutions.filter(solution => 
      progressData.some(
        progress => 
          progress.solution_id === solution.id && 
          progress.is_completed
      )
    );

    // Soluções recomendadas (não iniciadas)
    const recommendedSolutions = solutions.filter(solution => 
      !activeSolutions.some(active => active.id === solution.id) && 
      !completedSolutions.some(completed => completed.id === solution.id)
    );

    return {
      active: activeSolutions,
      completed: completedSolutions,
      recommended: recommendedSolutions
    };
  }, [solutions, progressData]);

  return {
    active,
    completed,
    recommended,
    loading: isLoading,
    error
  };
};
