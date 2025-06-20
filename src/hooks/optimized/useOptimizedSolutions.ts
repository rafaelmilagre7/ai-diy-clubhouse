
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types";
import { logger } from "@/utils/logger";

// Cache otimizado para soluções - TTL aumentado para melhor performance
const solutionsCache = new Map<string, { data: Solution[], timestamp: number }>();
const SOLUTIONS_TTL = 5 * 60 * 1000; // 5 minutos para soluções

export const useOptimizedSolutions = () => {
  const { user, profile } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status do cache para monitoramento
  const [cacheStatus, setCacheStatus] = useState({
    isCached: false,
    cacheAge: 0,
    lastUpdate: new Date()
  });

  const isAdmin = profile?.role === 'admin';

  // CORREÇÃO: Query otimizada sem JOINs desnecessários
  const fetchOptimizedSolutions = useCallback(async () => {
    const now = Date.now();
    const cacheKey = `solutions_${isAdmin ? 'admin' : 'user'}`;
    const cached = solutionsCache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < SOLUTIONS_TTL) {
      logger.info('[OPTIMIZED] Usando cache de soluções', { 
        count: cached.data.length,
        isAdmin,
        cacheAge: Math.round((now - cached.timestamp) / 1000)
      });
      
      setCacheStatus({
        isCached: true,
        cacheAge: Math.round((now - cached.timestamp) / 1000),
        lastUpdate: new Date(cached.timestamp)
      });
      
      return cached.data;
    }

    setCacheStatus(prev => ({ ...prev, isCached: false }));

    try {
      logger.info('[OPTIMIZED] Buscando soluções otimizadas', { isAdmin });

      // Buscar progresso do usuário para otimizar a query
      let userProgressSolutions: string[] = [];
      if (user?.id) {
        const { data: progressData } = await supabase
          .from("progress")
          .select("solution_id")
          .eq("user_id", user.id as any);
        
        userProgressSolutions = (progressData || []).map((p: any) => p.solution_id).filter(Boolean);
        
        logger.info('[OPTIMIZED] Progresso do usuário encontrado:', {
          solutionsWithProgress: userProgressSolutions.length
        });
      }

      // Query principal para soluções
      let query = supabase
        .from("solutions")
        .select("*")
        .order("created_at", { ascending: false });

      // Filtrar por publicadas se não for admin
      if (!isAdmin) {
        query = query.eq("published", true as any);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        logger.error('[OPTIMIZED] Erro ao buscar soluções:', fetchError);
        throw fetchError;
      }

      const validSolutions = (data || []) as Solution[];
      
      logger.info('[OPTIMIZED] Soluções encontradas:', {
        total: validSolutions.length,
        published: validSolutions.filter(s => s.published).length,
        drafts: validSolutions.filter(s => !s.published).length,
        isAdmin
      });

      // Atualizar cache
      solutionsCache.set(cacheKey, {
        data: validSolutions,
        timestamp: now
      });

      setCacheStatus({
        isCached: false,
        cacheAge: 0,
        lastUpdate: new Date()
      });

      return validSolutions;
    } catch (error: any) {
      logger.error('[OPTIMIZED] Erro na query de soluções:', error);
      throw error;
    }
  }, [user?.id, isAdmin]);

  // Invalidar cache quando necessário
  const invalidateCache = useCallback(() => {
    logger.info('[OPTIMIZED] Invalidando cache de soluções');
    solutionsCache.clear();
    setCacheStatus(prev => ({ ...prev, isCached: false }));
  }, []);

  useEffect(() => {
    const loadSolutions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchOptimizedSolutions();
        setSolutions(data);
        
        logger.info('[OPTIMIZED] Soluções carregadas com sucesso:', {
          count: data.length,
          cached: cacheStatus.isCached
        });
        
      } catch (error: any) {
        logger.error('[OPTIMIZED] Erro ao carregar soluções:', error);
        setError(error.message || "Erro ao carregar soluções");
      } finally {
        setLoading(false);
      }
    };

    loadSolutions();
  }, [fetchOptimizedSolutions, cacheStatus.isCached]);

  return {
    solutions,
    loading,
    error,
    cacheStatus,
    invalidateCache
  };
};
