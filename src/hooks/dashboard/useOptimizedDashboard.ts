
import { useMemo } from "react";
import { useDashboardProgress } from "./useDashboardProgress";
import { useDashboardData } from "./useDashboardData";
import { useAdvancedLazyLoading } from "../performance/useAdvancedLazyLoading";
import { useOptimizedQuery } from "../cache/useOptimizedQueries";
import { useBackgroundSync } from "../background/useBackgroundSync";
import { Solution } from "@/lib/supabase";

export const useOptimizedDashboard = () => {
  // Configurar background sync para dados críticos
  const { setupAutoSync } = useBackgroundSync();
  
  // Query otimizada para soluções com cache inteligente
  const { data: solutions, isLoading: solutionsLoading } = useOptimizedQuery(
    async () => {
      // Importação dinâmica para reduzir bundle inicial
      const { fetchOptimizedSolutions } = await import('@/services/optimizedSolutionsService');
      return fetchOptimizedSolutions();
    },
    {
      cacheType: 'solutions',
      enablePreload: true,
      select: (data: Solution[]) => data, // Manter compatibilidade
      onQuerySuccess: (data) => {
        // Setup background sync após carregar dados iniciais
        setupAutoSync('solutions', async () => {
          const { fetchOptimizedSolutions } = await import('@/services/optimizedSolutionsService');
          return fetchOptimizedSolutions();
        });
      }
    }
  );

  // Query otimizada para progresso com dependência
  const {
    active,
    completed,
    recommended,
    loading: progressLoading
  } = useDashboardProgress(solutions);

  // Ativar preload inteligente de rotas críticas
  useAdvancedLazyLoading({
    preloadRoutes: ['/solutions', '/tools', '/implementation'],
    preloadDelay: 1000, // Reduzido para melhor UX
    priority: 'high' // Aumentada prioridade
  });

  // Background sync para progresso
  setupAutoSync('progress', async () => {
    if (!solutions) return [];
    const { fetchUserProgress } = await import('@/services/optimizedProgressService');
    return fetchUserProgress();
  });

  // Calcular estado de loading consolidado com otimização
  const isLoading = useMemo(() => 
    solutionsLoading || progressLoading
  , [solutionsLoading, progressLoading]);

  // Memoizar totais com performance otimizada
  const totals = useMemo(() => {
    // Early return se dados não estão prontos
    if (!active || !completed || !recommended) {
      return {
        active: 0,
        completed: 0,
        recommended: 0,
        total: 0
      };
    }

    return {
      active: active.length,
      completed: completed.length,
      recommended: recommended.length,
      total: active.length + completed.length + recommended.length
    };
  }, [active?.length, completed?.length, recommended?.length]);

  // Memoizar resultado final para máxima performance
  return useMemo(() => ({
    active: active || [],
    completed: completed || [],
    recommended: recommended || [],
    isLoading,
    totals,
    hasData: totals.total > 0
  }), [active, completed, recommended, isLoading, totals]);
};
