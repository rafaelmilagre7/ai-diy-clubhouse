
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types";
import { logger } from "@/utils/logger";

// Cache otimizado para progresso - TTL aumentado para melhor performance
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const PROGRESS_TTL = 60 * 1000; // Aumentado para 60 segundos para melhor performance

export const useOptimizedProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CORREÇÃO CRÍTICA: Query simples sem campos inexistentes
  const fetchOptimizedProgress = useCallback(async () => {
    if (!user?.id) {
      return [];
    }

    const now = Date.now();
    const cacheKey = `progress_all_${user.id}`;
    const cached = progressCache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < PROGRESS_TTL) {
      logger.info('[OPTIMIZED] Usando cache de progresso', { count: cached.data.length });
      return cached.data;
    }

    try {
      logger.info('[OPTIMIZED] Buscando progressos do usuário', { userId: user.id });
      
      // CORREÇÃO: Query com campos que existem nas tabelas reais
      const { data, error: fetchError } = await supabase
        .from("progress")
        .select(`
          solution_id, 
          is_completed, 
          current_module, 
          completed_modules,
          solutions!inner(
            id, 
            title, 
            published, 
            category, 
            difficulty, 
            thumbnail_url,
            slug
          )
        `)
        .eq("user_id", user.id as any);

      if (fetchError) {
        logger.error('[OPTIMIZED] Erro ao buscar progresso:', fetchError);
        throw fetchError;
      }

      const validProgress = data || [];
      logger.info('[OPTIMIZED] Progressos encontrados:', { 
        total: validProgress.length,
        completed: validProgress.filter(p => (p as any).is_completed).length,
        active: validProgress.filter(p => !(p as any).is_completed).length
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

  // Processamento simplificado e otimizado
  const processedData = useMemo(() => {
    if (!progressData.length) {
      logger.info('[OPTIMIZED] Nenhum progresso encontrado, retornando soluções como recomendadas');
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
        progressData.map(progress => [(progress as any).solution_id, progress])
      );

      const result = {
        active: [] as Solution[],
        completed: [] as Solution[],
        recommended: [] as Solution[]
      };

      // Processar soluções com progresso
      progressData.forEach(progress => {
        if ((progress as any).solutions) {
          const solution = {
            id: (progress as any).solutions.id,
            title: (progress as any).solutions.title,
            published: (progress as any).solutions.published,
            category: (progress as any).solutions.category,
            difficulty: (progress as any).solutions.difficulty,
            thumbnail_url: (progress as any).solutions.thumbnail_url,
            slug: (progress as any).solutions.slug,
            // Campos obrigatórios para compatibilidade
            description: '',
            created_at: '',
            updated_at: ''
          } as Solution;

          if ((progress as any).is_completed) {
            result.completed.push(solution);
          } else {
            result.active.push(solution);
          }
        }
      });

      // Adicionar soluções sem progresso como recomendadas
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
          completed: data.filter(p => (p as any).is_completed).length,
          active: data.filter(p => !(p as any).is_completed).length
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
