
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

// Cache local otimizado
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export const useDashboardProgress = (solutions: Solution[] = []) => {
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
    
    // Verificar cache local primeiro - MAS não usar durante debug
    const cacheKey = `progress_${user.id}`;
    const cached = progressCache.get(cacheKey);
    
    console.log("🔧 [DASHBOARD DEBUG] Cache status:", {
      hasCached: !!cached,
      cacheAge: cached ? Date.now() - cached.timestamp : 0,
      cacheTTL: CACHE_TTL,
      shouldUseCache: cached && Date.now() - cached.timestamp < CACHE_TTL
    });
    
    // DESATIVAR CACHE TEMPORARIAMENTE PARA DEBUG
    // if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    //   return cached.data;
    // }
    
    try {
      console.log("🔧 [DASHBOARD DEBUG] Fazendo query fresh para buscar progresso...");
      
      // Query otimizada com batch
      const { data, error } = await supabase
        .from("progress")
        .select("solution_id, is_completed, completed_at, last_activity, created_at")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("useDashboardProgress: Erro na query:", error);
        throw error;
      }
      
      const result = data || [];
      
      console.log("🔧 [DASHBOARD DEBUG] Dados recebidos do Supabase:", result);
      
      // Atualizar cache local
      progressCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error("useDashboardProgress: Erro na execução:", error);
      throw error;
    }
  }, [user?.id]);
  
  // Query React Query otimizada
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-progress', user?.id],
    queryFn: fetchProgress,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!(user?.id),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 2000
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
        
        console.log(`🔧 [DASHBOARD DEBUG] Solução: ${solution.title}`, {
          solutionId: solution.id,
          hasProgress: !!progress,
          isCompleted: progress?.is_completed,
          progressData: progress
        });
        
        if (!progress) {
          recommended.push(solution);
        } else if (progress.is_completed) {
          completed.push(solution);
          console.log(`✅ [DASHBOARD DEBUG] Adicionando à lista de concluídas: ${solution.title}`);
        } else {
          active.push(solution);
        }
      });

      console.log(`🔧 [DASHBOARD DEBUG] Resultado final:`, {
        totalSolutions: solutions.length,
        completedCount: completed.length,
        activeCount: active.length,
        recommendedCount: recommended.length,
        completedSolutions: completed.map(s => s.title)
      });

      return {
        active,
        completed,
        recommended,
        isEmpty: false
      };
    } catch (err) {
      console.error("useDashboardProgress: Erro no processamento:", err);
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

// Manter exportação do hook otimizado para compatibilidade
export const useOptimizedDashboardProgress = useDashboardProgress;

// Tipos para compatibilidade
export interface Dashboard {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
}

export interface UserProgress {
  solution_id: string;
  is_completed: boolean;
  completed_at?: string;
  last_activity?: string;
  created_at: string;
}
