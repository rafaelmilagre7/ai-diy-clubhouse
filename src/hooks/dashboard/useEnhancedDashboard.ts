
import { useMemo } from "react";
import { useOptimizedDashboard } from "./useOptimizedDashboard";
import { useDashboardData } from "./useDashboardData";
import { logger } from "@/utils/logger";

// CORREÇÃO: Hook híbrido simplificado
export const useEnhancedDashboard = () => {
  // Tentar usar versão otimizada primeiro
  const optimized = useOptimizedDashboard();
  
  // Fallback para versão original
  const fallback = useDashboardData();

  // CORREÇÃO: Lógica de fallback mais simples
  const shouldUseFallback = useMemo(() => {
    // Se otimizado tem erro crítico, usar fallback
    if (optimized.error && !optimized.isLoading) {
      logger.warn('[ENHANCED] Usando fallback devido a erro', { error: optimized.error });
      return true;
    }
    
    return false;
  }, [optimized.error, optimized.isLoading]);

  // CORREÇÃO: Sempre retornar dados válidos
  return useMemo(() => {
    if (shouldUseFallback) {
      const { stats, loading, error } = fallback;
      
      const fallbackResult = {
        active: [],
        completed: [],
        recommended: [],
        isLoading: loading,
        error: error || null,
        totals: {
          active: 0,
          completed: 0,
          recommended: stats.totalSolutions || 0,
          total: stats.totalSolutions || 0
        },
        hasData: (stats.totalSolutions || 0) > 0,
        performance: {
          optimized: false,
          fallback: true
        }
      };
      
      logger.info('[ENHANCED] Retornando dados do fallback');
      return fallbackResult;
    }
    
    // CORREÇÃO: Garantir que sempre retorna dados válidos
    const optimizedResult = {
      active: optimized.active || [],
      completed: optimized.completed || [],
      recommended: optimized.recommended || [],
      isLoading: optimized.isLoading || false,
      error: optimized.error || null,
      totals: optimized.totals || {
        active: 0,
        completed: 0,
        recommended: 0,
        total: 0
      },
      hasData: optimized.hasData || false,
      performance: {
        ...optimized.performance,
        fallback: false
      }
    };
    
    logger.info('[ENHANCED] Retornando dados otimizados');
    return optimizedResult;
  }, [shouldUseFallback, optimized, fallback]);
};
