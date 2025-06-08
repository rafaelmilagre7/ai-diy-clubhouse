
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  console.log('[useDashboardProgress] Hook iniciado:', {
    userId: user?.id,
    solutionsCount: solutions?.length || 0
  });
  
  // Função para buscar o progresso - separada para facilitar cache
  const fetchProgress = useCallback(async () => {
    if (!user) {
      console.log("useDashboardProgress: Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }
    
    console.log("useDashboardProgress: Buscando progresso para o usuário", user.id);
    
    try {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("useDashboardProgress: Erro ao buscar progresso:", error);
        throw error;
      }
      
      console.log("useDashboardProgress: Progresso carregado com sucesso, itens:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("useDashboardProgress: Exception ao buscar progresso:", error);
      throw error;
    }
  }, [user]);
  
  // Usar React Query para cache e controle de estado
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: fetchProgress,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    enabled: !!user && Array.isArray(solutions) && solutions.length > 0,
    refetchOnWindowFocus: false, // Desativar refetch ao focar a janela
    refetchInterval: false, // Desativar refetch automático baseado em intervalo
    retry: 1, // Tentar apenas 1 vez antes de desistir
    meta: {
      onError: (err: any) => {
        console.error("Erro durante o carregamento do progresso:", err);
        // Não mostrar toast para evitar spam, apenas log
      }
    }
  });

  // Usar useMemo para processar os dados apenas quando necessário
  const { active, completed, recommended } = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      console.log("useDashboardProgress: Sem soluções para processar");
      return { active: [], completed: [], recommended: [] };
    }

    if (!progressData || !Array.isArray(progressData)) {
      console.log("useDashboardProgress: Sem dados de progresso - todas as soluções são recomendadas");
      return { 
        active: [], 
        completed: [], 
        recommended: solutions 
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
      );

      console.log("useDashboardProgress: Dados processados com sucesso", {
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
        recommended: solutions // Em caso de erro, tratar todas como recomendadas
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
