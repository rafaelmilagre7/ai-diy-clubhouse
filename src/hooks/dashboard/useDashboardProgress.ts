
import { useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  console.log("useDashboardProgress: Iniciando", { 
    hasUser: !!user, 
    solutionsCount: solutions.length 
  });
  
  // Buscar progresso com configuração otimizada
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
      
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("useDashboardProgress: Erro ao buscar progresso:", error);
        throw error;
      }
      
      console.log("useDashboardProgress: Progresso carregado:", data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!user, // Só executa se tem usuário
    onError: (err: any) => {
      console.error("useDashboardProgress: Erro no hook:", err);
      toast.error("Erro ao carregar progresso", {
        description: "Algumas funcionalidades podem não estar disponíveis"
      });
    }
  });

  // Processar dados com fallbacks robustos
  const { active, completed, recommended } = useMemo(() => {
    console.log("useDashboardProgress: Processando dados", {
      solutionsLength: solutions.length,
      progressDataLength: progressData?.length || 0
    });

    // Se não há soluções, retornar arrays vazios (não é erro)
    if (!solutions || solutions.length === 0) {
      console.log("useDashboardProgress: Sem soluções disponíveis");
      return { active: [], completed: [], recommended: [] };
    }

    // Se não há dados de progresso, todas são recomendadas
    if (!progressData || progressData.length === 0) {
      console.log("useDashboardProgress: Sem progresso, todas são recomendadas");
      return {
        active: [],
        completed: [],
        recommended: solutions.slice(0, 6) // Limitar para performance
      };
    }

    try {
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
      return { active: [], completed: [], recommended: solutions.slice(0, 6) };
    }
  }, [solutions, progressData]);

  return {
    active,
    completed,
    recommended,
    loading: isLoading,
    error
  };
};
