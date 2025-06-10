
import { useCallback, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "@/contexts/auth";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/dashboard/useDashboardProgress";
import { useLoading } from "@/contexts/LoadingContext";
import { logger } from "@/utils/logger";

// Hook centralizado para todos os dados do dashboard
export const useOptimizedDashboardData = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { setLoading, setMultipleLoading } = useLoading();
  const queryClient = useQueryClient();
  const lastFetchRef = useRef<number>(0);

  // Verificar se pode buscar dados
  const canFetchData = useMemo(() => 
    !authLoading && !!user && !!profile
  , [authLoading, user, profile]);

  // Carregar soluções com prioridade
  const { 
    solutions, 
    loading: solutionsLoading, 
    error: solutionsError 
  } = useSolutionsData();

  // Memoizar soluções para evitar recriações
  const stableSolutions = useMemo(() => {
    if (!solutions || !Array.isArray(solutions)) return [];
    return solutions;
  }, [solutions?.length, solutions?.map(s => s.id).join(',')]);

  // Carregar progresso baseado nas soluções
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError 
  } = useDashboardProgress(stableSolutions);

  // Gerenciar estados de loading centralizados
  const isLoading = solutionsLoading || progressLoading;
  
  // Atualizar estados de loading no context
  useMemo(() => {
    setMultipleLoading({
      solutions: solutionsLoading,
      progress: progressLoading,
      dashboard: isLoading
    });
  }, [solutionsLoading, progressLoading, isLoading, setMultipleLoading]);

  // Função para invalidar caches relacionados
  const invalidateData = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchRef.current < 2000) return; // Debounce de 2s
    lastFetchRef.current = now;

    queryClient.invalidateQueries({ queryKey: ['dashboard-progress'] });
    queryClient.invalidateQueries({ queryKey: ['solutions'] });
    
    logger.info('[Dashboard] Cache invalidado manualmente');
  }, [queryClient]);

  // Preload de dados secundários com requestIdleCallback
  const preloadSecondaryData = useCallback(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Precarregar dados que podem ser necessários
        queryClient.prefetchQuery({
          queryKey: ['user-progress', user?.id],
          queryFn: () => Promise.resolve(null),
          staleTime: 5 * 60 * 1000
        });
      }, { timeout: 3000 });
    }
  }, [queryClient, user?.id]);

  // Executar preload quando dados principais estiverem prontos
  useMemo(() => {
    if (!isLoading && stableSolutions.length > 0) {
      preloadSecondaryData();
    }
  }, [isLoading, stableSolutions.length, preloadSecondaryData]);

  return {
    // Dados principais
    solutions: stableSolutions,
    active: active || [],
    completed: completed || [],
    recommended: recommended || [],
    
    // Estados
    isLoading,
    error: solutionsError || progressError,
    canFetchData,
    
    // Métodos
    invalidateData,
    
    // Estatísticas memoizadas
    stats: useMemo(() => ({
      total: stableSolutions.length,
      activeCount: active?.length || 0,
      completedCount: completed?.length || 0,
      recommendedCount: recommended?.length || 0,
      progressPercentage: stableSolutions.length > 0 
        ? Math.round(((completed?.length || 0) / stableSolutions.length) * 100)
        : 0
    }), [stableSolutions.length, active?.length, completed?.length, recommended?.length])
  };
};
