
import { useMemo } from "react";
import { useOptimizedDashboard } from "./useOptimizedDashboard";
import { useDashboardData } from "./useDashboardData";
import { logger } from "@/utils/logger";

export const useEnhancedDashboard = () => {
  const optimized = useOptimizedDashboard();
  const fallback = useDashboardData();

  // Lógica de fallback simplificada
  const shouldUseFallback = useMemo(() => {
    // Se há erro crítico no otimizado e não está carregando
    if (optimized.error && !optimized.isLoading && optimized.totals.total === 0) {
      logger.warn('[ENHANCED] Usando fallback devido a erro:', optimized.error);
      return true;
    }
    return false;
  }, [optimized.error, optimized.isLoading, optimized.totals.total]);

  return useMemo(() => {
    if (shouldUseFallback) {
      // Usar dados do fallback
      const { solutions, loading, error } = fallback;
      const safeSolutions = Array.isArray(solutions) ? solutions : [];
      
      return {
        active: [],
        completed: [],
        recommended: safeSolutions,
        isLoading: loading,
        error,
        totals: {
          active: 0,
          completed: 0,
          recommended: safeSolutions.length,
          total: safeSolutions.length
        },
        hasData: safeSolutions.length > 0,
        performance: {
          optimized: false,
          fallback: true
        }
      };
    }
    
    // Usar dados otimizados
    return {
      active: optimized.active,
      completed: optimized.completed,
      recommended: optimized.recommended,
      isLoading: optimized.isLoading,
      error: optimized.error,
      totals: optimized.totals,
      hasData: optimized.hasData,
      performance: {
        optimized: true,
        fallback: false
      }
    };
  }, [shouldUseFallback, optimized, fallback]);
};
