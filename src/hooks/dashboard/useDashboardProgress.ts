
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

// Cache otimizado com WeakMap para melhor performance
const progressCache = new WeakMap<object, any>();

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  // Memoizar hash das soluções para evitar recálculos
  const solutionsHash = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return 'empty';
    }
    
    const ids = solutions.map(s => s.id).sort().join(',');
    return `${ids}_${solutions.length}`;
  }, [solutions]);

  // Função de fetch otimizada e memoizada
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }
    
    try {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar progresso:", error);
      throw error;
    }
  }, [user?.id]);
  
  // Query otimizada com configurações de performance
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-progress', user?.id, solutionsHash],
    queryFn: fetchProgress,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos no cache
    enabled: !!(user?.id && Array.isArray(solutions) && solutions.length > 0),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });

  // Processar dados com memoização inteligente
  const processedData = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return { 
        active: [], 
        completed: [], 
        recommended: [],
        isEmpty: true
      };
    }

    if (!progressData || !Array.isArray(progressData)) {
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }

    try {
      // Usar Map para performance O(1) na busca
      const progressMap = new Map(
        progressData.map(progress => [progress.solution_id, progress])
      );

      // Categorizar soluções de forma eficiente
      const categorizedSolutions = solutions.reduce((acc, solution) => {
        const progress = progressMap.get(solution.id);
        
        if (!progress) {
          acc.recommended.push(solution);
        } else if (progress.is_completed) {
          acc.completed.push(solution);
        } else {
          acc.active.push(solution);
        }
        
        return acc;
      }, {
        active: [] as Solution[],
        completed: [] as Solution[],
        recommended: [] as Solution[]
      });

      return {
        ...categorizedSolutions,
        isEmpty: false
      };
    } catch (err) {
      console.error("Erro ao processar dados:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }
  }, [solutions, progressData]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading: isLoading,
    error,
    isEmpty: processedData.isEmpty
  };
};
