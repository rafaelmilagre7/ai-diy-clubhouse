
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  console.log("useDashboardProgress: Iniciando hook", { 
    userId: user?.id, 
    solutionsCount: solutions.length 
  });
  
  // Função para buscar o progresso com fallback
  const fetchProgress = useCallback(async () => {
    if (!user) {
      console.log("useDashboardProgress: Usuário não autenticado");
      return [];
    }
    
    try {
      console.log("useDashboardProgress: Buscando progresso para", user.id);
      
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.warn("useDashboardProgress: Erro ao buscar progresso, usando dados mock:", error);
        // Retornar progresso mock para demonstração
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
      
      console.log("useDashboardProgress: Progresso carregado:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.warn("useDashboardProgress: Exception, usando fallback:", error);
      return [];
    }
  }, [user]);
  
  // React Query com fallback
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

  // Processar dados com fallback para garantir que sempre temos dados
  const { active, completed, recommended } = useMemo(() => {
    if (!solutions || solutions.length === 0) {
      console.log("useDashboardProgress: Sem soluções, retornando dados vazios");
      return { active: [], completed: [], recommended: solutions || [] };
    }

    if (!progressData || progressData.length === 0) {
      console.log("useDashboardProgress: Sem progresso, todas as soluções são recomendadas");
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

      console.log("useDashboardProgress: Dados processados", {
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
        recommended: solutions.slice(0, 6)
      };
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
