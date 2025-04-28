
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  // Função para buscar o progresso - separada para facilitar cache
  const fetchProgress = useCallback(async () => {
    if (!user) {
      console.log("useDashboardProgress: Usuário não autenticado");
      return [];
    }
    
    try {
      console.log(`Buscando progresso para usuário ${user.id}`);
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("Erro ao buscar progresso:", error);
        toast("Erro ao carregar seu progresso. Tente novamente.");
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Erro na busca de progresso:", error);
      return [];
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
    retry: 2, // Limitar número de tentativas em caso de erro
  });

  // Usar useMemo para processar os dados apenas quando necessário
  const { active, completed, recommended } = useMemo(() => {
    if (!solutions || solutions.length === 0 || !progressData) {
      console.log("useDashboardProgress: Retornando arrays vazios devido a dados insuficientes");
      return { active: [], completed: [], recommended: [] };
    }

    // Filtrar soluções ativas (em progresso)
    const activeSolutions = solutions.filter(solution => 
      progressData.some(
        progress => 
          progress.solution_id === solution.id && 
          !progress.is_completed
      )
    );

    // Filtrar soluções completas
    const completedSolutions = solutions.filter(solution => 
      progressData.some(
        progress => 
          progress.solution_id === solution.id && 
          progress.is_completed
      )
    );

    // Filtrar soluções recomendadas (não iniciadas)
    const recommendedSolutions = solutions.filter(solution => 
      !activeSolutions.some(active => active.id === solution.id) && 
      !completedSolutions.some(completed => completed.id === solution.id)
    );

    console.log(`useDashboardProgress: Processado ${activeSolutions.length} ativas, ${completedSolutions.length} completas, ${recommendedSolutions.length} recomendadas`);

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
