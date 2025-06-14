
import { useMemo } from "react";
import { useDashboardProgress } from "./useDashboardProgress";
import { useDashboardData } from "./useDashboardData";
import { useAdvancedLazyLoading } from "../performance/useAdvancedLazyLoading";
import { Solution } from "@/lib/supabase";

export const useOptimizedDashboard = () => {
  // Buscar dados base
  const { solutions, loading: dataLoading } = useDashboardData();
  
  // Processar progresso com otimizações
  const {
    active,
    completed,
    recommended,
    loading: progressLoading
  } = useDashboardProgress(solutions);

  // Ativar preload inteligente de rotas críticas
  useAdvancedLazyLoading({
    preloadRoutes: ['/solutions', '/tools', '/implementation'],
    preloadDelay: 2000,
    priority: 'normal'
  });

  // Calcular estado de loading consolidado
  const isLoading = useMemo(() => 
    dataLoading || progressLoading
  , [dataLoading, progressLoading]);

  // Memoizar totais para evitar recálculos
  const totals = useMemo(() => ({
    active: active.length,
    completed: completed.length,
    recommended: recommended.length,
    total: active.length + completed.length + recommended.length
  }), [active.length, completed.length, recommended.length]);

  return {
    active,
    completed, 
    recommended,
    isLoading,
    totals,
    hasData: totals.total > 0
  };
};
