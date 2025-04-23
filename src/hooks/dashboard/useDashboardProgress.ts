
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const [active, setActive] = useState<Solution[]>([]);
  const [completed, setCompleted] = useState<Solution[]>([]);
  const [recommended, setRecommended] = useState<Solution[]>([]);

  // Usar react-query para buscar o progresso
  const { 
    data: progressData, 
    isLoading: loading 
  } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao buscar progresso:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && solutions.length > 0,
    staleTime: 2 * 60 * 1000 // 2 minutos de cache
  });

  // Processar as categorias de soluções usando useMemo para evitar cálculos desnecessários
  const processedSolutions = useMemo(() => {
    if (!solutions || !progressData) {
      return { active: [], completed: [], recommended: [] };
    }

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

    return {
      active: activeSolutions,
      completed: completedSolutions,
      recommended: recommendedSolutions
    };
  }, [solutions, progressData]);

  // Atualizar os estados apenas quando o processamento mudar
  useEffect(() => {
    if (processedSolutions) {
      setActive(processedSolutions.active);
      setCompleted(processedSolutions.completed);
      setRecommended(processedSolutions.recommended);
    }
  }, [processedSolutions]);

  return {
    active,
    completed,
    recommended,
    loading
  };
};
