
import { useMemo } from "react";
import { useOptimizedSolutions } from "@/hooks/optimized/useOptimizedSolutions";
import { useOptimizedProgress } from "@/hooks/optimized/useOptimizedProgress";
import { logger } from "@/utils/logger";

export const useOptimizedDashboard = () => {
  // Usar hooks simplificados
  const { 
    solutions, 
    loading: solutionsLoading, 
    error: solutionsError
  } = useOptimizedSolutions();
  
  const {
    active,
    completed,
    recommended,
    loading: progressLoading,
    error: progressError
  } = useOptimizedProgress(solutions);

  // Estado consolidado
  const isLoading = useMemo(() => 
    solutionsLoading || progressLoading
  , [solutionsLoading, progressLoading]);

  // Tratamento de erro mais robusto
  const error = useMemo(() => {
    if (solutionsError && progressError) {
      return `Erro nas soluções e progresso: ${solutionsError}, ${progressError}`;
    }
    return solutionsError || progressError;
  }, [solutionsError, progressError]);

  // Totais com verificação de segurança
  const totals = useMemo(() => {
    const safeActive = Array.isArray(active) ? active : [];
    const safeCompleted = Array.isArray(completed) ? completed : [];
    const safeRecommended = Array.isArray(recommended) ? recommended : [];

    const result = {
      active: safeActive.length,
      completed: safeCompleted.length,
      recommended: safeRecommended.length,
      total: safeActive.length + safeCompleted.length + safeRecommended.length
    };

    logger.info('[DASHBOARD] Totais calculados:', result);
    return result;
  }, [active, completed, recommended]);

  // Garantir arrays válidos sempre
  const safeData = useMemo(() => ({
    active: Array.isArray(active) ? active : [],
    completed: Array.isArray(completed) ? completed : [],
    recommended: Array.isArray(recommended) ? recommended : []
  }), [active, completed, recommended]);

  return {
    ...safeData,
    isLoading,
    error,
    totals,
    hasData: totals.total > 0,
    performance: {
      optimized: true,
      fallback: false
    }
  };
};
