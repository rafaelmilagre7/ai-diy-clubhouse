
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { perfMonitor, measureAsync } from '@/utils/performanceMonitor';

// Cache local otimizado
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

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
    
    perfMonitor.startTimer('useOptimizedDashboardProgress', 'fetchProgress', { userId: user.id });
    
    // Verificar cache local primeiro
    const cacheKey = `progress_${user.id}`;
    const cached = progressCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      perfMonitor.logEvent('useOptimizedDashboardProgress', 'cache_hit', { userId: user.id });
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'fetchProgress', { userId: user.id, fromCache: true });
      return cached.data;
    }
    
    try {
      // Query otimizada com batch usando measureAsync
      const result = await measureAsync(
        'useOptimizedDashboardProgress',
        'supabaseQuery',
        async () => {
          const response = await supabase
            .from("progress")
            .select("solution_id, is_completed, completed_at, last_activity, created_at")
            .eq("user_id", user.id);
          return response;
        },
        { userId: user.id }
      ) as SupabaseResponse<any[]>;
        
      if (result.error) {
        console.error("useOptimizedDashboardProgress: Erro na query:", result.error);
        perfMonitor.endTimer('useOptimizedDashboardProgress', 'fetchProgress', { 
          userId: user.id, 
          success: false, 
          error: result.error 
        });
        throw result.error;
      }
      
      const data = result.data || [];
      
      // Atualizar cache local
      progressCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'fetchProgress', { 
        userId: user.id, 
        success: true, 
        recordCount: data.length,
        fromCache: false 
      });
      
      return data;
    } catch (error) {
      console.error("useOptimizedDashboardProgress: Erro na execução:", error);
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'fetchProgress', { 
        userId: user.id, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }, [user?.id]);
  
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
    perfMonitor.startTimer('useOptimizedDashboardProgress', 'processData', { 
      solutionsCount: solutions?.length || 0,
      progressCount: progressData?.length || 0
    });
    
    // Validação de entrada
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'processData', { isEmpty: true });
      return { 
        active: [], 
        completed: [], 
        recommended: [],
        isEmpty: true
      };
    }

    if (!progressData || !Array.isArray(progressData)) {
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'processData', { 
        noProgressData: true,
        recommendedCount: solutions.length
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

      const result = {
        active,
        completed,
        recommended,
        isEmpty: false
      };

      perfMonitor.endTimer('useOptimizedDashboardProgress', 'processData', { 
        activeCount: active.length,
        completedCount: completed.length,
        recommendedCount: recommended.length,
        success: true
      });

      return result;
    } catch (err) {
      console.error("useOptimizedDashboardProgress: Erro no processamento:", err);
      perfMonitor.endTimer('useOptimizedDashboardProgress', 'processData', { 
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
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
