
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

// Cache local otimizado
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export const useOptimizedDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  // Hash estável das soluções para otimização
  const solutionsHash = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return 'empty';
    }
    return solutions.map(s => s.id).sort().join(',');
  }, [solutions]);
  
  // Função de busca otimizada
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }
    
    // Verificar cache local primeiro
    const cacheKey = `progress_${user.id}`;
    const cached = progressCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    try {
      // Query otimizada com batch
      const { data, error } = await supabase
        .from("progress")
        .select("solution_id, is_completed, completed_at, last_activity, created_at")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("useOptimizedDashboardProgress: Erro na query:", error);
        throw error;
      }
      
      const result = data || [];
      
      // Atualizar cache local
      progressCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error("useOptimizedDashboardProgress: Erro na execução:", error);
      throw error;
    }
  }, [user?.id]);
  
  // Query React Query otimizada
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['optimized-dashboard-progress', user?.id, solutionsHash],
    queryFn: fetchProgress,
    staleTime: 90 * 1000, // 90 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!(user?.id && Array.isArray(solutions) && solutions.length > 0),
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    retry: 2
  });

  // Processamento otimizado com memoização
  const processedData = useMemo(() => {
    // Validação de entrada
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
      // Criar mapa de progresso para lookup O(1)
      const progressMap = new Map();
      progressData.forEach(progress => {
        progressMap.set(progress.solution_id, progress);
      });

      // Categorização otimizada
      const active: Solution[] = [];
      const completed: Solution[] = [];
      const recommended: Solution[] = [];

      solutions.forEach(solution => {
        const progress = progressMap.get(solution.id);
        
        if (!progress) {
          recommended.push(solution);
        } else if (progress.is_completed) {
          completed.push(solution);
        } else {
          active.push(solution);
        }
      });

      return {
        active,
        completed,
        recommended,
        isEmpty: false
      };
    } catch (err) {
      console.error("useOptimizedDashboardProgress: Erro no processamento:", err);
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
