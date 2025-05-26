
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  console.log("useDashboardProgress iniciado com:", {
    user: !!user,
    solutionsCount: solutions?.length || 0,
    userId: user?.id
  });
  
  // Função para buscar o progresso - separada para facilitar cache
  const fetchProgress = useCallback(async () => {
    if (!user) {
      console.log("useDashboardProgress: Usuário não autenticado");
      return []; // Retornar array vazio ao invés de throw
    }
    
    console.log("useDashboardProgress: Buscando progresso para o usuário", user.id);
    
    try {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("useDashboardProgress: Erro ao buscar progresso:", error);
        return []; // Retornar array vazio em caso de erro
      }
      
      console.log("useDashboardProgress: Progresso carregado com sucesso, itens:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("useDashboardProgress: Exception ao buscar progresso:", error);
      return []; // Retornar array vazio em caso de exception
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
    enabled: !!user, // Não depende mais de solutions.length
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 2,
    meta: {
      onError: (err: any) => {
        console.error("Erro durante o carregamento do progresso:", err);
        // Remover toast de erro para evitar spam
      }
    }
  });

  // Usar useMemo para processar os dados apenas quando necessário
  const { active, completed, recommended } = useMemo(() => {
    console.log("useDashboardProgress: Processando dados", {
      hasSolutions: solutions && solutions.length > 0,
      hasProgressData: progressData && progressData.length > 0,
      progressDataLength: progressData?.length || 0
    });

    // Se não há soluções, retornar arrays vazios
    if (!solutions || solutions.length === 0) {
      console.log("useDashboardProgress: Sem soluções para processar");
      return { active: [], completed: [], recommended: [] };
    }

    // Se não há dados de progresso, todas as soluções são recomendadas
    if (!progressData || progressData.length === 0) {
      console.log("useDashboardProgress: Sem progresso, todas as soluções são recomendadas");
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
        recommended: solutions // Em caso de erro, mostrar todas como recomendadas
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
