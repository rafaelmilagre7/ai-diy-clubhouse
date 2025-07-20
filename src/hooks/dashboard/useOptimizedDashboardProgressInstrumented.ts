
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { perfMonitor, measureAsync } from "@/utils/performanceMonitor";

// Cache local otimizado com instrumentação
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export const useOptimizedDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  // Métricas de diagnóstico
  const [hookStartTime] = useState(() => performance.now());
  
  // Hash estável das soluções para otimização
  const solutionsHash = useMemo(() => {
    const startTime = performance.now();
    
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'solutions_empty');
      return 'empty';
    }
    
    const hash = solutions.map(s => s.id).sort().join(',');
    const duration = performance.now() - startTime;
    
    perfMonitor.logEvent('useOptimizedDashboardProgress', 'solutions_hash_computed', {
      solutionsCount: solutions.length,
      duration,
      hashLength: hash.length
    });
    
    return hash;
  }, [solutions]);
  
  // Função de busca otimizada
  const fetchProgress = useCallback(async () => {
    perfMonitor.startTimer('useOptimizedDashboardProgress', 'fetchProgress', {
      userId: user?.id,
      solutionsCount: solutions.length
    });
    
    if (!user?.id) {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'no_user');
      throw new Error("Usuário não autenticado");
    }
    
    // Verificar cache local primeiro
    const cacheKey = `progress_${user.id}`;
    const cached = progressCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'cache_hit', {
        cacheAge: Date.now() - cached.timestamp,
        dataCount: cached.data.length
      });
      
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'fetchProgress', {
        fromCache: true,
        dataCount: cached.data.length
      });
      
      return cached.data;
    }
    
    try {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'cache_miss');
      
      // Query otimizada com batch
      const result = await measureAsync(
        'useOptimizedDashboardProgress',
        'supabase_query',
        () => supabase
          .from("progress")
          .select("solution_id, is_completed, completed_at, last_activity, created_at")
          .eq("user_id", user.id),
        { userId: user.id }
      );
        
      if (result.error) {
        perfMonitor.logEvent('useOptimizedDashboardProgress', 'query_error', { 
          error: result.error.message 
        });
        console.error("useOptimizedDashboardProgress: Erro na query:", result.error);
        throw result.error;
      }
      
      const data = result.data || [];
      
      // Atualizar cache local
      progressCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'fetchProgress', {
        fromCache: false,
        dataCount: data.length,
        cacheUpdated: true
      });
      
      return data;
    } catch (error) {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'fetch_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'fetchProgress', {
        fromCache: false,
        hasError: true
      });
      
      console.error("useOptimizedDashboardProgress: Erro na execução:", error);
      throw error;
    }
  }, [user?.id, solutions.length]);
  
  // Query React Query super otimizada para evitar loops
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
    refetchOnMount: false, // Importante: não refetch no mount
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 2000
  });

  // Processamento otimizado com memoização
  const processedData = useMemo(() => {
    const startTime = performance.now();
    
    // Validação de entrada
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'processing_empty_solutions');
      return { 
        active: [], 
        completed: [], 
        recommended: [],
        isEmpty: true
      };
    }

    if (!progressData || !Array.isArray(progressData)) {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'processing_no_progress', {
        solutionsCount: solutions.length
      });
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

      const duration = performance.now() - startTime;
      
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'processing_complete', {
        duration,
        solutionsCount: solutions.length,
        progressCount: progressData.length,
        activeCount: active.length,
        completedCount: completed.length,
        recommendedCount: recommended.length,
        totalTime: performance.now() - hookStartTime
      });

      return {
        active,
        completed,
        recommended,
        isEmpty: false
      };
    } catch (err) {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'processing_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
        solutionsCount: solutions.length
      });
      
      console.error("useOptimizedDashboardProgress: Erro no processamento:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }
  }, [solutions, progressData, hookStartTime]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading: isLoading,
    error,
    isEmpty: processedData.isEmpty
  };
};
