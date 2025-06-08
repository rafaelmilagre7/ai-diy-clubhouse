
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import { logger } from "@/utils/logger";

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  logger.debug('[useDashboardProgress] Hook iniciado:', {
    userId: user?.id,
    solutionsCount: solutions?.length || 0
  });
  
  // Função para buscar o progresso - otimizada com melhor tratamento de erro
  const fetchProgress = useCallback(async () => {
    if (!user) {
      logger.warn("useDashboardProgress: Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }
    
    logger.debug("useDashboardProgress: Buscando progresso para o usuário", user.id);
    
    try {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        logger.error("useDashboardProgress: Erro ao buscar progresso:", error);
        throw error;
      }
      
      logger.info("useDashboardProgress: Progresso carregado com sucesso", { 
        itemsCount: data?.length || 0,
        userId: user.id 
      });
      
      return data || [];
    } catch (error) {
      logger.error("useDashboardProgress: Exception ao buscar progresso:", error);
      throw error;
    }
  }, [user]);
  
  // Usar React Query para cache e controle de estado otimizado
  const { 
    data: progressData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: fetchProgress,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos antes de garbage collection
    enabled: !!user && Array.isArray(solutions) && solutions.length > 0,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      // Retry apenas para erros de rede
      if (error.message?.includes('network') && failureCount < 2) {
        return true;
      }
      return false;
    },
    meta: {
      onError: (err: any) => {
        logger.error("Erro durante o carregamento do progresso:", err);
        
        // Toast apenas para erros críticos que afetam a experiência
        if (err.message?.includes('network') || err.message?.includes('timeout')) {
          toast.error("Problema de conexão. Dados podem estar desatualizados.");
        }
      }
    }
  });

  // Usar useMemo para processar os dados apenas quando necessário
  const { active, completed, recommended } = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      logger.debug("useDashboardProgress: Sem soluções para processar");
      return { active: [], completed: [], recommended: [] };
    }

    if (!progressData || !Array.isArray(progressData)) {
      logger.debug("useDashboardProgress: Sem dados de progresso - todas as soluções são recomendadas");
      return { 
        active: [], 
        completed: [], 
        recommended: solutions 
      };
    }

    try {
      // Criar maps para performance melhorada
      const progressMap = new Map(
        progressData.map(progress => [progress.solution_id, progress])
      );

      // Categorizar soluções com base no progresso
      const activeSolutions: Solution[] = [];
      const completedSolutions: Solution[] = [];
      const recommendedSolutions: Solution[] = [];

      solutions.forEach(solution => {
        const progress = progressMap.get(solution.id);
        
        if (progress) {
          if (progress.is_completed) {
            completedSolutions.push(solution);
          } else {
            activeSolutions.push(solution);
          }
        } else {
          recommendedSolutions.push(solution);
        }
      });

      logger.info("useDashboardProgress: Dados processados com sucesso", {
        active: activeSolutions.length, 
        completed: completedSolutions.length, 
        recommended: recommendedSolutions.length,
        totalSolutions: solutions.length
      });

      return {
        active: activeSolutions,
        completed: completedSolutions,
        recommended: recommendedSolutions
      };
    } catch (err) {
      logger.error("useDashboardProgress: Erro ao processar dados:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: solutions // Em caso de erro, tratar todas como recomendadas
      };
    }
  }, [solutions, progressData]);

  // Função para refrescar dados manualmente
  const refreshProgress = useCallback(() => {
    logger.debug("useDashboardProgress: Refresh manual solicitado");
    return refetch();
  }, [refetch]);

  return {
    active,
    completed,
    recommended,
    loading: isLoading,
    error,
    refreshProgress
  };
};
