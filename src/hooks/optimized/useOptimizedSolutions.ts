
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";

// Cache global otimizado com TTL mais curto para debug
const optimizedCache = new Map<string, { data: Solution[], timestamp: number, ttl: number }>();
const DEFAULT_TTL = 30 * 1000; // Reduzido para 30 segundos para debug
const ADMIN_TTL = 15 * 1000; // 15 segundos para admins

export const useOptimizedSolutions = () => {
  const { user, profile } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  
  const isAdmin = profile?.role === 'admin';
  const cacheKey = `solutions_all_${user?.id}_${isAdmin ? 'admin' : 'user'}`;
  const cacheTTL = isAdmin ? ADMIN_TTL : DEFAULT_TTL;

  // CORREÇÃO: Campos otimizados para query - usar thumbnail_url em vez de cover_image_url
  const queryFields = useMemo(() => {
    const baseFields = [
      'id', 'title', 'description', 'category', 'difficulty', 
      'published', 'created_at', 'thumbnail_url',
      'estimated_time', 'success_rate', 'tags'
    ];
    
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
      logger.info('[OPTIMIZED] Usando cache de soluções', { count: cached.data.length });
      return cached.data;
    }

    try {
      logger.info('[OPTIMIZED] Buscando soluções otimizadas', { isAdmin, userId: user.id });

      // CORREÇÃO: Buscar soluções baseado no progresso do usuário também
      // Primeiro buscar todas as soluções que o usuário tem permissão de ver
      let query = supabase
        .from("solutions")
        .select(queryFields)
        .order("created_at", { ascending: false });

      // CORREÇÃO: Incluir soluções não publicadas se o usuário tem progresso nelas
      if (!isAdmin) {
        // Buscar IDs das soluções que o usuário tem progresso
        const { data: userProgress } = await supabase
          .from("progress")
          .select("solution_id")
          .eq("user_id", user.id);

        const userSolutionIds = userProgress?.map(p => p.solution_id) || [];

        if (userSolutionIds.length > 0) {
          // Buscar soluções publicadas OU soluções que o usuário tem progresso
          query = query.or(`published.eq.true,id.in.(${userSolutionIds.join(',')})`);
        } else {
          // Se não tem progresso, só soluções publicadas
          query = query.eq("published", true);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        logger.error('[OPTIMIZED] Erro ao buscar soluções', { error: fetchError });
        throw fetchError;
      }

      const validSolutions = ((data as any[]) || []).filter(item => {
        return item && 
               typeof item === 'object' && 
               typeof item.id === 'string' &&
               typeof item.title === 'string';
      }) as Solution[];

      logger.info('[OPTIMIZED] Soluções carregadas:', {
        total: validSolutions.length,
        published: validSolutions.filter(s => s.published).length,
        unpublished: validSolutions.filter(s => !s.published).length
      });

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
        
        logger.info('[OPTIMIZED] Soluções carregadas com sucesso', {
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

  // Função para invalidar cache
  const invalidateCache = useMemo(() => () => {
    optimizedCache.clear(); // Limpar todo o cache para garantir dados frescos
    logger.info('[OPTIMIZED] Cache completamente limpo');
  }, []);

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
