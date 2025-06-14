
import { useMemo } from "react";
import { useOptimizedSolutions } from "@/hooks/optimized/useOptimizedSolutions";
import { useOptimizedProgress } from "@/hooks/optimized/useOptimizedProgress";
import { logger } from "@/utils/logger";

export const useOptimizedDashboard = () => {
  // Usar hooks otimizados com fallback automático
  const { 
    solutions, 
    loading: solutionsLoading, 
    error: solutionsError,
    cacheStatus: solutionsCacheStatus
  } = useOptimizedSolutions();
  
  const {
    active,
    completed,
    recommended,
    loading: progressLoading,
    error: progressError
  } = useOptimizedProgress(solutions);

  // Estado consolidado de loading
  const isLoading = useMemo(() => 
    solutionsLoading || progressLoading
  , [solutionsLoading, progressLoading]);

  // Consolidar erros
  const error = useMemo(() => 
    solutionsError || progressError
  , [solutionsError, progressError]);

  // Totais memoizados
  const totals = useMemo(() => ({
    active: active.length,
    completed: completed.length,
    recommended: recommended.length,
    total: active.length + completed.length + recommended.length
  }), [active.length, completed.length, recommended.length]);

  // Log de performance para monitoramento
  useMemo(() => {
    if (!isLoading && totals.total > 0) {
      logger.info('[OPTIMIZED DASHBOARD] Performance stats:', {
        totalSolutions: totals.total,
        active: totals.active,
        completed: totals.completed,
        recommended: totals.recommended,
        cacheHit: solutionsCacheStatus.isCached,
        cacheAge: solutionsCacheStatus.cacheAge
      });
    }
  }, [isLoading, totals, solutionsCacheStatus]);

  return {
    active,
    completed,
    recommended,
    isLoading,
    error,
    totals,
    hasData: totals.total > 0,
    // Informações para debug
    performance: {
      cacheStatus: solutionsCacheStatus,
      totalQueries: 2, // solutions + progress
      optimized: true
    }
  };
};
