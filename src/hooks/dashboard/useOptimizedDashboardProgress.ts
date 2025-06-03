
import { useMemo } from "react";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { useOptimizedQuery } from "@/hooks/common/useOptimizedQuery";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

/**
 * Hook otimizado para progresso do dashboard
 * Melhora performance e remove logs desnecessários
 */
export const useOptimizedDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useOptimizedAuth();
  
  console.log("useOptimizedDashboardProgress: Iniciando com user:", !!user, "solutions:", solutions.length);
  
  // Fetch progress com cache otimizado
  const { 
    data: progressData,
    isLoading,
    error
  } = useOptimizedQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("useOptimizedDashboardProgress: Usuário não autenticado");
        throw new Error("Usuário não autenticado");
      }
      
      console.log("useOptimizedDashboardProgress: Buscando progresso para usuário:", user.id);
      
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("useOptimizedDashboardProgress: Erro ao buscar progresso:", error);
        throw error;
      }
      
      console.log("useOptimizedDashboardProgress: Progresso carregado:", data?.length || 0);
      return data || [];
    },
    enabled: !!user && solutions.length > 0
  });

  // Processar dados de forma otimizada
  const { active, completed, recommended } = useMemo(() => {
    if (!solutions.length || !progressData) {
      console.log("useOptimizedDashboardProgress: Sem dados para processar");
      return { active: [], completed: [], recommended: [] };
    }

    console.log("useOptimizedDashboardProgress: Processando dados:", {
      solutions: solutions.length,
      progressData: progressData.length
    });

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

    console.log("useOptimizedDashboardProgress: Dados processados:", {
      active: activeSolutions.length,
      completed: completedSolutions.length,
      recommended: recommendedSolutions.length
    });

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
