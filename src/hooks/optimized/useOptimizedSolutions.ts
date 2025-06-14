
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";

// Cache global otimizado com TTL
const optimizedCache = new Map<string, { data: Solution[], timestamp: number, ttl: number }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
const ADMIN_TTL = 2 * 60 * 1000; // 2 minutos para admins (dados mudam mais)

export const useOptimizedSolutions = () => {
  const { user, profile } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  
  const isAdmin = profile?.role === 'admin';
  const cacheKey = `solutions_${user?.id}_${isAdmin ? 'admin' : 'user'}`;
  const cacheTTL = isAdmin ? ADMIN_TTL : DEFAULT_TTL;

  // Memoizar campos específicos para query otimizada
  const queryFields = useMemo(() => {
    const baseFields = [
      'id', 'title', 'description', 'category', 'difficulty', 
      'published', 'created_at', 'updated_at', 'cover_image_url'
    ];
    
    // Admins precisam de mais campos
    if (isAdmin) {
      return [...baseFields, 'created_by'].join(', ');
    }
    
    return baseFields.join(', ');
  }, [isAdmin]);

  const fetchOptimizedSolutions = useMemo(() => async (): Promise<Solution[]> => {
    if (!user) return [];

    const now = Date.now();
    
    // Verificar cache válido primeiro
    const cached = optimizedCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    try {
      // Query otimizada com campos específicos
      let query = supabase
        .from("solutions")
        .select(queryFields)
        .order("created_at", { ascending: false });

      // Filtro otimizado baseado no perfil
      if (!isAdmin) {
        query = query.eq("published", true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        logger.error('[OPTIMIZED] Erro ao buscar soluções', { error: fetchError });
        throw fetchError;
      }

      // Type guard mais específico para validar se é uma Solution válida
      const isValidSolution = (item: unknown): item is Solution => {
        const sol = item as Solution;
        return sol && 
               typeof sol === 'object' && 
               typeof sol.id === 'string' &&
               typeof sol.title === 'string' &&
               typeof sol.description === 'string';
      };

      const validSolutions = (data || []).filter(isValidSolution);

      // Atualizar cache com TTL específico
      optimizedCache.set(cacheKey, {
        data: validSolutions,
        timestamp: now,
        ttl: cacheTTL
      });

      return validSolutions;
    } catch (error: any) {
      logger.error('[OPTIMIZED] Erro na query otimizada', { error });
      throw error;
    }
  }, [user, queryFields, isAdmin, cacheKey, cacheTTL]);

  useEffect(() => {
    const loadSolutions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Debounce para evitar múltiplas chamadas
      const now = Date.now();
      if (now - lastFetchRef.current < 1000) {
        return;
      }
      lastFetchRef.current = now;

      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchOptimizedSolutions();
        setSolutions(data);
        
        logger.info('[OPTIMIZED] Soluções carregadas', {
          count: data.length,
          isAdmin,
          cached: optimizedCache.has(cacheKey)
        });
        
      } catch (error: any) {
        logger.error('[OPTIMIZED] Erro ao carregar soluções', { error: error.message || "Erro desconhecido" });
        setError(error.message || "Erro ao carregar soluções");
      } finally {
        setLoading(false);
      }
    };

    loadSolutions();
  }, [user, isAdmin, fetchOptimizedSolutions, cacheKey]);

  // Função para invalidar cache (útil para atualizações)
  const invalidateCache = useMemo(() => () => {
    optimizedCache.delete(cacheKey);
    logger.info('[OPTIMIZED] Cache invalidado', { cacheKey });
  }, [cacheKey]);

  return {
    solutions,
    loading,
    error,
    invalidateCache,
    // Informações para debug/monitoramento
    cacheStatus: {
      isCached: optimizedCache.has(cacheKey),
      cacheAge: optimizedCache.has(cacheKey) 
        ? Date.now() - optimizedCache.get(cacheKey)!.timestamp 
        : 0,
      ttl: cacheTTL
    }
  };
};
