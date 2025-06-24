
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types";
import { logger } from "@/utils/logger";

// Cache otimizado para progresso - TTL mais conservador
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const PROGRESS_TTL = 30 * 1000; // 30 segundos para evitar problemas

export const useOptimizedProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query simplificada sem JOINs problemáticos
  const fetchSimpleProgress = useCallback(async () => {
    if (!user?.id) {
      logger.info('[PROGRESS] Usuário não logado');
      return [];
    }

    const now = Date.now();
    const cacheKey = `progress_simple_${user.id}`;
    const cached = progressCache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < PROGRESS_TTL) {
      logger.info('[PROGRESS] Usando cache', { count: cached.data.length });
      return cached.data;
    }

    try {
      logger.info('[PROGRESS] Buscando progressos simples', { userId: user.id });
      
      // Query simples apenas na tabela progress
      const { data, error: fetchError } = await supabase
        .from("progress")
        .select("solution_id, is_completed, current_module, completed_modules")
        .eq("user_id", user.id);

      if (fetchError) {
        logger.error('[PROGRESS] Erro na query simples:', fetchError);
        throw fetchError;
      }

      const validProgress = data || [];
      logger.info('[PROGRESS] Dados encontrados:', { 
        total: validProgress.length,
        completed: validProgress.filter(p => p.is_completed).length
      });

      // Atualizar cache
      progressCache.set(cacheKey, {
        data: validProgress,
        timestamp: now
      });

      return validProgress;
    } catch (error: any) {
      logger.error('[PROGRESS] Erro na busca:', error);
      throw error;
    }
  }, [user?.id]);

  // Processamento otimizado com fallback seguro
  const processedData = useMemo(() => {
    try {
      if (!Array.isArray(solutions) || solutions.length === 0) {
        logger.info('[PROGRESS] Nenhuma solução disponível');
        return {
          active: [],
          completed: [],
          recommended: []
        };
      }

      if (!Array.isArray(progressData) || progressData.length === 0) {
        logger.info('[PROGRESS] Nenhum progresso, todas as soluções são recomendadas');
        return {
          active: [],
          completed: [],
          recommended: solutions
        };
      }

      // Criar mapa de progressos
      const progressMap = new Map();
      progressData.forEach(progress => {
        if (progress && progress.solution_id) {
          progressMap.set(progress.solution_id, progress);
        }
      });

      const result = {
        active: [] as Solution[],
        completed: [] as Solution[],
        recommended: [] as Solution[]
      };

      // Processar cada solução
      solutions.forEach(solution => {
        if (!solution || !solution.id) return;

        const progress = progressMap.get(solution.id);
        
        if (progress) {
          if (progress.is_completed) {
            result.completed.push(solution);
          } else {
            result.active.push(solution);
          }
        } else {
          result.recommended.push(solution);
        }
      });

      logger.info('[PROGRESS] Processamento concluído:', {
        active: result.active.length,
        completed: result.completed.length,
        recommended: result.recommended.length
      });

      return result;
    } catch (err) {
      logger.error("[PROGRESS] Erro no processamento:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: solutions || []
      };
    }
  }, [progressData, solutions]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchSimpleProgress();
        setProgressData(data);
        
        logger.info('[PROGRESS] Carregamento bem-sucedido');
        
      } catch (error: any) {
        logger.error('[PROGRESS] Erro no carregamento:', error);
        setError(error.message || "Erro ao carregar progresso");
        setProgressData([]); // Garantir array vazio em caso de erro
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [fetchSimpleProgress]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading,
    error
  };
};
