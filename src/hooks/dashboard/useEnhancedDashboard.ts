
import { useMemo } from "react";
import { useOptimizedDashboard } from "./useOptimizedDashboard";
import { useDashboardData } from "./useDashboardData";
import { logger } from "@/utils/logger";

// Hook híbrido que usa otimizado com fallback para o original
export const useEnhancedDashboard = () => {
  // Tentar usar versão otimizada primeiro
  const optimized = useOptimizedDashboard();
  
  // Fallback para versão original em caso de erro
  const fallback = useDashboardData();

  // Decidir qual usar baseado no estado
  const shouldUseFallback = useMemo(() => {
    // Se otimizado tem erro, usar fallback
    if (optimized.error && !optimized.isLoading) {
      logger.warn('[ENHANCED] Usando fallback devido a erro', { error: optimized.error });
      return true;
    }
    
    // Se otimizado não tem dados e não está loading, usar fallback
    if (!optimized.hasData && !optimized.isLoading) {
      logger.info('[ENHANCED] Usando fallback - sem dados otimizados', { hasData: optimized.hasData });
      return true;
    }
    
    return false;
  }, [optimized.error, optimized.isLoading, optimized.hasData]);

  // Retornar dados apropriados
  return useMemo(() => {
    if (shouldUseFallback) {
      // Converter dados do fallback para formato esperado
      const { solutions, loading, error } = fallback;
      
      return {
        active: solutions.filter(s => false), // Simplificado para fallback
        completed: solutions.filter(s => false),
        recommended: solutions,
        isLoading: loading,
        error,
        totals: {
          active: 0,
          completed: 0,
          recommended: solutions.length,
          total: solutions.length
        },
        hasData: solutions.length > 0,
        performance: {
          optimized: false,
          fallback: true
        }
      };
    }
    
    return {
      ...optimized,
      performance: {
        ...optimized.performance,
        fallback: false
      }
    };
  }, [shouldUseFallback, optimized, fallback]);
};
