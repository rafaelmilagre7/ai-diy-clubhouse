
import { useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  console.log("useDashboardProgress: Iniciando", { 
    hasUser: !!user, 
    solutionsCount: solutions?.length || 0
  });
  
  // Buscar progresso com configuração ultra-resiliente
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("useDashboardProgress: Usuário não autenticado");
        return [];
      }
      
      console.log("useDashboardProgress: Buscando progresso para", user.id);
      
      try {
        const { data, error } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id);
          
        if (error) {
          console.error("useDashboardProgress: Erro ao buscar progresso:", error);
          // Retornar array vazio em vez de throw para não quebrar a UI
          return [];
        }
        
        console.log("useDashboardProgress: Progresso carregado:", data?.length || 0);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("useDashboardProgress: Erro capturado:", err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // Só tentar 1 vez para não travar
      if (failureCount >= 1) return false;
      return true;
    },
    refetchOnWindowFocus: false,
    enabled: !!user, // Só executa se tem usuário
  });

  // Processar dados com fallbacks ultra-robustos
  const { active, completed, recommended } = useMemo(() => {
    console.log("useDashboardProgress: Processando dados", {
      solutionsLength: solutions?.length || 0,
      progressDataLength: progressData?.length || 0
    });

    // Fallbacks defensivos
    const safeSolutions = Array.isArray(solutions) ? solutions : [];
    const safeProgressData = Array.isArray(progressData) ? progressData : [];

    // Se não há soluções válidas, retornar estrutura vazia
    if (safeSolutions.length === 0) {
      console.log("useDashboardProgress: Sem soluções válidas disponíveis");
      return { active: [], completed: [], recommended: [] };
    }

    // Se não há dados de progresso, todas são recomendadas
    if (safeProgressData.length === 0) {
      console.log("useDashboardProgress: Sem progresso, todas são recomendadas");
      return {
        active: [],
        completed: [],
        recommended: safeSolutions.slice(0, 6) // Limitar para performance
      };
    }

    try {
      // Soluções ativas (em progresso)
      const activeSolutions = safeSolutions.filter(solution => 
        solution && safeProgressData.some(
          progress => 
            progress && 
            progress.solution_id === solution.id && 
            !progress.is_completed
        )
      );

      // Soluções completas
      const completedSolutions = safeSolutions.filter(solution => 
        solution && safeProgressData.some(
          progress => 
            progress &&
            progress.solution_id === solution.id && 
            progress.is_completed
        )
      );

      // Soluções recomendadas (não iniciadas)
      const recommendedSolutions = safeSolutions.filter(solution => 
        solution &&
        !activeSolutions.some(active => active && active.id === solution.id) && 
        !completedSolutions.some(completed => completed && completed.id === solution.id)
      ).slice(0, 6); // Limitar para performance

      console.log("useDashboardProgress: Processamento concluído", {
        active: activeSolutions.length,
        completed: completedSolutions.length,
        recommended: recommendedSolutions.length
      });

      return {
        active: activeSolutions,
        completed: completedSolutions,
        recommended: recommendedSolutions
      };
    } catch (err) {
      console.error("useDashboardProgress: Erro ao processar dados:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: safeSolutions.slice(0, 6) 
      };
    }
  }, [solutions, progressData]);

  return {
    active: Array.isArray(active) ? active : [],
    completed: Array.isArray(completed) ? completed : [],
    recommended: Array.isArray(recommended) ? recommended : [],
    loading: isLoading,
    error,
    hasData: (active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0) > 0
  };
};
