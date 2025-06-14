
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
    
    // Se otimizado não tem dados válidos e não está loading, considerar fallback
    const hasValidOptimizedData = optimized.totals && optimized.totals.total > 0;
    if (!hasValidOptimizedData && !optimized.isLoading) {
      logger.info('[ENHANCED] Considerando fallback - dados otimizados insuficientes', { 
        totals: optimized.totals,
        hasData: optimized.hasData 
      });
      
      // Só usar fallback se o fallback tiver dados válidos
      const hasFallbackData = fallback.solutions && fallback.solutions.length > 0;
      if (hasFallbackData) {
        logger.info('[ENHANCED] Usando fallback - tem dados no fallback');
        return true;
      }
    }
    
    return false;
  }, [optimized.error, optimized.isLoading, optimized.totals, optimized.hasData, fallback.solutions]);

  // Retornar dados apropriados
  return useMemo(() => {
    if (shouldUseFallback) {
      // Converter dados do fallback para formato esperado
      const { solutions, loading, error } = fallback;
      
      // Para o fallback, assumir todas como recomendadas já que não temos dados de progresso
      const fallbackResult = {
        active: [],
        completed: [],
        recommended: solutions || [],
        isLoading: loading,
        error,
        totals: {
          active: 0,
          completed: 0,
          recommended: solutions ? solutions.length : 0,
          total: solutions ? solutions.length : 0
        },
        hasData: solutions ? solutions.length > 0 : false,
        performance: {
          optimized: false,
          fallback: true
        }
      };
      
      logger.info('[ENHANCED] Retornando dados do fallback:', {
        totalSolutions: fallbackResult.totals.total,
        hasError: !!error
      });
      
      return fallbackResult;
    }
    
    const optimizedResult = {
      ...optimized,
      performance: {
        ...optimized.performance,
        fallback: false
      }
    };
    
    logger.info('[ENHANCED] Retornando dados otimizados:', {
      totalSolutions: optimizedResult.totals?.total || 0,
      hasError: !!optimizedResult.error
    });
    
    return optimizedResult;
  }, [shouldUseFallback, optimized, fallback]);
};
