
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { logger } from "@/utils/logger";

// Cache otimizado para progresso
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const PROGRESS_TTL = 2 * 60 * 1000; // 2 minutos - dados de progresso mudam mais

export const useOptimizedProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoizar IDs das soluções para otimizar queries
  const solutionIds = useMemo(() => 
    solutions.map(s => s.id).filter(Boolean)
  , [solutions]);

  const cacheKey = `progress_${user?.id}_${solutionIds.join(',')}`;

  // Função otimizada para buscar progresso
  const fetchOptimizedProgress = useCallback(async () => {
    if (!user?.id || solutionIds.length === 0) {
      return [];
    }

    const now = Date.now();
    const cached = progressCache.get(cacheKey);
    
    // Verificar cache válido
    if (cached && (now - cached.timestamp) < PROGRESS_TTL) {
      return cached.data;
    }

    try {
      // Query otimizada: apenas campos necessários + filtro por solution_ids
      const { data, error: fetchError } = await supabase
        .from("progress")
        .select("solution_id, is_completed, progress_percentage, updated_at")
        .eq("user_id", user.id)
        .in("solution_id", solutionIds);

      if (fetchError) {
        logger.error('[OPTIMIZED] Erro ao buscar progresso:', fetchError);
        throw fetchError;
      }

      const validProgress = data || [];

      // Atualizar cache
      progressCache.set(cacheKey, {
        data: validProgress,
        timestamp: now
      });

      return validProgress;
    } catch (error: any) {
      logger.error('[OPTIMIZED] Erro na query de progresso:', error);
      throw error;
    }
  }, [user?.id, solutionIds, cacheKey]);

  // Processar dados de forma otimizada
  const processedData = useMemo(() => {
    if (!solutions.length || !progressData.length) {
      return {
        active: [],
        completed: [],
        recommended: solutions,
        isEmpty: solutions.length === 0
      };
    }

    try {
      // Usar Map para performance O(1)
      const progressMap = new Map(
        progressData.map(progress => [progress.solution_id, progress])
      );

      const result = solutions.reduce((acc, solution) => {
        const progress = progressMap.get(solution.id);
        
        if (!progress) {
          acc.recommended.push(solution);
        } else if (progress.is_completed) {
          acc.completed.push(solution);
        } else {
          acc.active.push(solution);
        }
        
        return acc;
      }, {
        active: [] as Solution[],
        completed: [] as Solution[],
        recommended: [] as Solution[]
      });

      return {
        ...result,
        isEmpty: false
      };
    } catch (err) {
      logger.error("[OPTIMIZED] Erro ao processar dados:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }
  }, [solutions, progressData]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchOptimizedProgress();
        setProgressData(data);
        
        logger.info('[OPTIMIZED] Progresso carregado:', {
          count: data.length,
          cached: progressCache.has(cacheKey)
        });
        
      } catch (error: any) {
        logger.error('[OPTIMIZED] Erro ao carregar progresso:', error);
        setError(error.message || "Erro ao carregar progresso");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [fetchOptimizedProgress, cacheKey]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading,
    error,
    isEmpty: processedData.isEmpty
  };
};
