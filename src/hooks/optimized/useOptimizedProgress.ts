
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { logger } from "@/utils/logger";

// Cache otimizado para progresso - limpar cache corrompido
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const PROGRESS_TTL = 30 * 1000; // Reduzido para 30 segundos para debug

export const useOptimizedProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CORREÇÃO CRÍTICA: Buscar TODOS os progressos do usuário, não apenas das soluções fornecidas
  const fetchOptimizedProgress = useCallback(async () => {
    if (!user?.id) {
      return [];
    }

    const now = Date.now();
    const cacheKey = `progress_all_${user.id}`;
    const cached = progressCache.get(cacheKey);
    
    // Cache mais curto para garantir dados atualizados
    if (cached && (now - cached.timestamp) < PROGRESS_TTL) {
      logger.info('[OPTIMIZED] Usando cache de progresso', { count: cached.data.length });
      return cached.data;
    }

    try {
      logger.info('[OPTIMIZED] Buscando TODOS os progressos do usuário', { userId: user.id });
      
      // CORREÇÃO: Buscar TODOS os progressos do usuário, sem filtro por solution_id
      const { data, error: fetchError } = await supabase
        .from("progress")
        .select(`
          solution_id, 
          is_completed, 
          current_module, 
          completed_modules, 
          updated_at,
          solutions!inner(id, title, published)
        `)
        .eq("user_id", user.id);

      if (fetchError) {
        logger.error('[OPTIMIZED] Erro ao buscar progresso:', fetchError);
        throw fetchError;
      }

      const validProgress = data || [];
      logger.info('[OPTIMIZED] Progressos encontrados:', { 
        total: validProgress.length,
        completed: validProgress.filter(p => p.is_completed).length,
        active: validProgress.filter(p => !p.is_completed).length
      });

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
  }, [user?.id]);

  // CORREÇÃO: Processar dados baseado em TODOS os progressos, não apenas nas soluções fornecidas
  const processedData = useMemo(() => {
    if (!progressData.length) {
      logger.info('[OPTIMIZED] Nenhum progresso encontrado, retornando soluções fornecidas como recomendadas');
      return {
        active: [],
        completed: [],
        recommended: solutions,
        isEmpty: solutions.length === 0
      };
    }

    try {
      // Criar mapa de progressos por solution_id
      const progressMap = new Map(
        progressData.map(progress => [progress.solution_id, progress])
      );

      // CORREÇÃO: Categorizar baseado em TODOS os progressos encontrados
      const result = {
        active: [] as Solution[],
        completed: [] as Solution[],
        recommended: [] as Solution[]
      };

      // Primeiro, processar soluções com progresso
      progressData.forEach(progress => {
        if (progress.solutions) {
          const solution = {
            id: progress.solutions.id,
            title: progress.solutions.title,
            published: progress.solutions.published,
            // Adicionar outros campos necessários da solução
          } as Solution;

          if (progress.is_completed) {
            result.completed.push(solution);
          } else {
            result.active.push(solution);
          }
        }
      });

      // Depois, adicionar soluções fornecidas que não têm progresso como recomendadas
      solutions.forEach(solution => {
        const hasProgress = progressMap.has(solution.id);
        if (!hasProgress) {
          result.recommended.push(solution);
        }
      });

      logger.info('[OPTIMIZED] Dados processados:', {
        active: result.active.length,
        completed: result.completed.length,
        recommended: result.recommended.length,
        total: result.active.length + result.completed.length + result.recommended.length
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
  }, [progressData, solutions]);

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
        
        logger.info('[OPTIMIZED] Progresso carregado com sucesso:', {
          count: data.length,
          completed: data.filter(p => p.is_completed).length,
          active: data.filter(p => !p.is_completed).length
        });
        
      } catch (error: any) {
        logger.error('[OPTIMIZED] Erro ao carregar progresso:', error);
        setError(error.message || "Erro ao carregar progresso");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [fetchOptimizedProgress, user?.id]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading,
    error,
    isEmpty: processedData.isEmpty
  };
};
