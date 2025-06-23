
import { useMemo } from "react";
import { useOptimizedSolutions } from "@/hooks/optimized/useOptimizedSolutions";
import { useOptimizedProgress } from "@/hooks/optimized/useOptimizedProgress";
import { logger } from "@/utils/logger";

export const useOptimizedDashboard = () => {
  // Usar hooks otimizados corrigidos
  const { 
    solutions, 
    loading: solutionsLoading, 
    error: solutionsError,
    cacheStatus: solutionsCacheStatus,
    invalidateCache
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

  // Totais memoizados com logs detalhados
  const totals = useMemo(() => {
    const result = {
      active: active.length,
      completed: completed.length,
      recommended: recommended.length,
      total: active.length + completed.length + recommended.length
    };

    logger.info('[OPTIMIZED DASHBOARD] Totais calculados:', {
      ...result,
      solutionsCount: solutions.length,
      isLoading,
      hasError: !!error
    });

    return result;
  }, [active.length, completed.length, recommended.length, solutions.length, isLoading, error]);

  // Log de performance para monitoramento
  useMemo(() => {
    if (!isLoading) {
      logger.info('[OPTIMIZED DASHBOARD] Dashboard carregado:', {
        totalSolutions: totals.total,
        active: totals.active,
        completed: totals.completed,
        recommended: totals.recommended,
        cacheHit: solutionsCacheStatus.isCached,
        cacheAge: solutionsCacheStatus.cacheAge,
        hasError: !!error
      });
    }
  }, [isLoading, totals, solutionsCacheStatus, error]);

  return {
    active,
    completed,
    recommended,
    isLoading,
    error,
    totals,
    hasData: totals.total > 0,
    // Informações para debug e invalidação de cache
    performance: {
      cacheStatus: solutionsCacheStatus,
      totalQueries: 2, // solutions + progress
      optimized: true,
      invalidateCache // Função para limpar cache se necessário
    }
  };
};
