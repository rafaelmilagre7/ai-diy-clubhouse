
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Verificar se temos dados em cache primeiro
  const cachedProgressData = queryClient.getQueryData<any[]>(['progress', user?.id]);
  
  // Função para buscar o progresso - separada para facilitar cache
  const fetchProgress = useCallback(async () => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.id);
      
    if (error) {
      throw error;
    }
    
    return data;
  }, [user]);
  
  // Usar React Query para cache e controle de estado
  const { 
    data: progressData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: fetchProgress,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    enabled: !!user && solutions.length > 0,
    refetchOnWindowFocus: false, // Desativar refetch ao focar a janela
    refetchInterval: false, // Desativar refetch automático baseado em intervalo
    placeholderData: cachedProgressData, // Usar dados em cache como placeholder
  });

  // Usar useMemo para processar os dados apenas quando necessário
  const { active, completed, recommended } = useMemo(() => {
    // Usar dados em cache ou recém-buscados - para renderização instantânea
    const dataToUse = progressData || cachedProgressData;
    
    // Se não tivermos dados ou soluções, retornar objetos vazios
    if (!solutions || solutions.length === 0 || !dataToUse) {
      return { active: [], completed: [], recommended: [] };
    }

    // Soluções ativas (em progresso)
    const activeSolutions = solutions.filter(solution => 
      dataToUse.some(
        progress => 
          progress.solution_id === solution.id && 
          !progress.is_completed
      )
    );

    // Soluções completas
    const completedSolutions = solutions.filter(solution => 
      dataToUse.some(
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
  }, [solutions, progressData, cachedProgressData]);

  const refreshProgress = useCallback(() => {
    return refetch();
  }, [refetch]);

  return {
    active,
    completed,
    recommended,
    loading: isLoading && !cachedProgressData, // Só considera loading se não tiver cache
    refreshProgress
  };
};
