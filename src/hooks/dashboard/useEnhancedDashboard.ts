
import { useMemo } from "react";
import { useOptimizedDashboard } from "./useOptimizedDashboard";
import { useDashboardData } from "./useDashboardData";
import { logger } from "@/utils/logger";

// Hook híbrido com fallback automático melhorado
export const useEnhancedDashboard = () => {
  // Tentar usar versão otimizada primeiro
  const optimized = useOptimizedDashboard();
  
  // Fallback para versão original em caso de erro
  const fallback = useDashboardData();

  // CORREÇÃO: Lógica de fallback mais robusta
  const shouldUseFallback = useMemo(() => {
    // Se otimizado tem erro crítico, usar fallback
    if (optimized.error && !optimized.isLoading) {
      logger.warn('[ENHANCED] Usando fallback devido a erro crítico', { error: optimized.error });
      return true;
    }
    
    // CORREÇÃO: Não usar fallback se otimizado está funcionando
    // Mesmo que não tenha dados, pode ser normal (usuário novo)
    if (!optimized.error && !optimized.isLoading) {
      logger.info('[ENHANCED] Usando dados otimizados', { 
        totals: optimized.totals,
        hasData: optimized.hasData 
      });
      return false;
    }
    
    // Se otimizado ainda está carregando, aguardar
    if (optimized.isLoading) {
      logger.debug('[ENHANCED] Aguardando carregamento otimizado');
      return false;
    }
    
    return false;
  }, [optimized.error, optimized.isLoading, optimized.totals, optimized.hasData]);

  // Retornar dados apropriados
  return useMemo(() => {
    if (shouldUseFallback) {
      // Converter dados do fallback para formato esperado
      const { solutions, loading, error } = fallback;
      
      // CORREÇÃO: Processar soluções do fallback corretamente
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
      active: optimizedResult.totals?.active || 0,
      completed: optimizedResult.totals?.completed || 0,
      recommended: optimizedResult.totals?.recommended || 0,
      hasError: !!optimizedResult.error
    });
    
    return optimizedResult;
  }, [shouldUseFallback, optimized, fallback]);
};
