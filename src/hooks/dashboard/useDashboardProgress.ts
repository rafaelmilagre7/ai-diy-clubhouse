
import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  console.log("📈 useDashboardProgress: Hook iniciado", { 
    userId: user?.id, 
    solutionsCount: solutions?.length || 0 
  });
  
  // Função para buscar o progresso com fallback robusto
  const fetchProgress = useCallback(async () => {
    if (!user) {
      console.log("📈 useDashboardProgress: Usuário não autenticado, retornando array vazio");
      return [];
    }
    
    try {
      console.log("📈 useDashboardProgress: Buscando progresso para usuário", user.id);
      
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.warn("⚠️ useDashboardProgress: Erro ao buscar progresso, usando fallback:", error);
        // Retornar progresso mock mínimo para demonstração
        return [
          {
            id: '1',
            user_id: user.id,
            solution_id: '1',
            is_completed: false,
            current_module: 1,
            created_at: new Date().toISOString()
          }
        ];
      }
      
      console.log("✅ useDashboardProgress: Progresso carregado:", data?.length || 0);
      return data || [];
      
    } catch (error) {
      console.warn("⚠️ useDashboardProgress: Exception capturada, usando fallback:", error);
      return [];
    }
  }, [user]);
  
  // React Query com fallback garantido
  const { 
    data: progressData = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: fetchProgress,
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!user,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: []
  });

  console.log("📊 useDashboardProgress: Estado do React Query", {
    progressCount: progressData?.length || 0,
    isLoading,
    hasError: !!error
  });

  // Processar dados com fallback garantido
  const { active, completed, recommended } = useMemo(() => {
    console.log("🔄 useDashboardProgress: Processando dados", {
      solutionsCount: solutions?.length || 0,
      progressCount: progressData?.length || 0
    });

    // Garantir que sempre temos arrays válidos
    const safeSolutions = Array.isArray(solutions) ? solutions : [];
    const safeProgress = Array.isArray(progressData) ? progressData : [];

    if (safeSolutions.length === 0) {
      console.log("📈 useDashboardProgress: Sem soluções, retornando arrays vazios");
      return { active: [], completed: [], recommended: [] };
    }

    if (safeProgress.length === 0) {
      console.log("📈 useDashboardProgress: Sem progresso, todas as soluções são recomendadas");
      const limitedRecommended = safeSolutions.slice(0, 6); // Limitar para performance
      return { 
        active: [], 
        completed: [], 
        recommended: limitedRecommended
      };
    }

    try {
      // Soluções ativas (em progresso)
      const activeSolutions = safeSolutions.filter(solution => 
        safeProgress.some(
          progress => 
            progress.solution_id === solution.id && 
            !progress.is_completed
        )
      );

      // Soluções completas
      const completedSolutions = safeSolutions.filter(solution => 
        safeProgress.some(
          progress => 
            progress.solution_id === solution.id && 
            progress.is_completed
        )
      );

      // Soluções recomendadas (não iniciadas)
      const recommendedSolutions = safeSolutions.filter(solution => 
        !activeSolutions.some(active => active.id === solution.id) && 
        !completedSolutions.some(completed => completed.id === solution.id)
      ).slice(0, 6); // Limitar para performance

      console.log("✅ useDashboardProgress: Dados processados com sucesso", {
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
      console.error("❌ useDashboardProgress: Erro ao processar dados:", err);
      // Fallback seguro em caso de erro
      const limitedRecommended = safeSolutions.slice(0, 6);
      return { 
        active: [], 
        completed: [], 
        recommended: limitedRecommended
      };
    }
  }, [solutions, progressData]);

  console.log("🏁 useDashboardProgress: Retornando resultados", {
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0,
    loading: isLoading
  });

  return {
    active: active || [],
    completed: completed || [],
    recommended: recommended || [],
    loading: isLoading,
    error
  };
};
