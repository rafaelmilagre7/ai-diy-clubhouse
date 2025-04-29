
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
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
      return data;
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
    enabled: !!user && solutions.length > 0,
    refetchOnWindowFocus: false, // Desativar refetch ao focar a janela
    refetchInterval: false, // Desativar refetch automático baseado em intervalo
    retry: 2, // Tentar 2 vezes antes de desistir
    onError: (err) => {
      console.error("Erro durante o carregamento do progresso:", err);
      toast.error("Erro ao carregar seu progresso", {
        description: "Algumas funcionalidades podem não estar disponíveis"
      });
    }
  });

  // Usar useMemo para processar os dados apenas quando necessário
  const { active, completed, recommended } = useMemo(() => {
    if (!solutions || solutions.length === 0 || !progressData) {
      console.log("useDashboardProgress: Sem dados para processar");
      return { active: [], completed: [], recommended: [] };
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
      return { active: [], completed: [], recommended: [] };
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
