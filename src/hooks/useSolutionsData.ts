
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useSecurityEnforcement } from "@/hooks/auth/useSecurityEnforcement";
import { useLoading } from "@/contexts/LoadingContext";
import { logger } from "@/utils/logger";

// Cache global otimizado
const solutionsCache = new Map<string, { data: Solution[], timestamp: number, version: string }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const DEBOUNCE_TIME = 1000; // 1 segundo

export const useSolutionsData = () => {
  const { user, profile } = useAuth();
  const { logDataAccess } = useSecurityEnforcement();
  const { setLoading } = useLoading();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Estados de busca e filtragem
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Computar canViewSolutions baseado no usuário atual
  const canViewSolutions = useMemo(() => !!user, [user]);

  // Chave de cache baseada no perfil do usuário com versioning
  const cacheKey = useMemo(() => {
    const isAdmin = profile?.role === 'admin';
    const version = `v2_${Date.now().toString().slice(-6)}`; // Versioning básico
    return `solutions_${user?.id}_${isAdmin ? 'admin' : 'user'}_${version}`;
  }, [user?.id, profile?.role]);

  // Função otimizada de fetch com abort controller
  const fetchSolutions = useCallback(async () => {
    if (!user) {
      logger.warn('[SOLUTIONS] Tentativa de carregar soluções sem autenticação');
      setLoading('solutions', false);
      return;
    }

    // Debounce: evitar múltiplas execuções
    const now = Date.now();
    if (now - lastFetchRef.current < DEBOUNCE_TIME) {
      return;
    }
    lastFetchRef.current = now;

    // Verificar cache primeiro
    const cached = solutionsCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      setSolutions(cached.data);
      setLoading('solutions', false);
      setError(null);
      
      logger.debug('[SOLUTIONS] Dados carregados do cache', {
        count: cached.data.length,
        cacheAge: Math.round((now - cached.timestamp) / 1000) + 's'
      });
      return;
    }

    // Cancelar request anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    try {
      setLoading('solutions', true);
      setError(null);

      // Log de acesso apenas uma vez
      try {
        await logDataAccess('solutions', 'fetch_list');
      } catch (auditError) {
        // Ignorar erros de auditoria silenciosamente
      }

      // Query otimizada com timeout
      let query = supabase.from("solutions").select("*");

      // Se não for admin, mostrar apenas soluções publicadas
      if (!profile || profile.role !== 'admin') {
        query = query.eq("published", true);
      }

      const { data, error: fetchError } = await query
        .order("created_at", { ascending: false })
        .abortSignal(abortControllerRef.current.signal);

      // Verificar se foi cancelado
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      if (fetchError) {
        logger.error('[SOLUTIONS] Erro ao buscar soluções:', fetchError);
        throw fetchError;
      }

      // Validar dados antes de definir no estado
      const validSolutions = (data || []).filter(solution => 
        solution && typeof solution.id === 'string'
      );

      // Atualizar cache com versioning
      solutionsCache.set(cacheKey, {
        data: validSolutions,
        timestamp: now,
        version: 'v2'
      });

      setSolutions(validSolutions);
      
      logger.info('[SOLUTIONS] Soluções carregadas do servidor:', {
        count: validSolutions.length,
        isAdmin: profile?.role === 'admin',
        userId: user.id.substring(0, 8) + '***'
      });

    } catch (error: any) {
      // Não logar erros de cancelamento
      if (error.name === 'AbortError') {
        return;
      }
      
      logger.error('[SOLUTIONS] Erro ao carregar soluções:', error);
      setError(error.message || "Erro ao carregar soluções");
    } finally {
      setLoading('solutions', false);
    }
  }, [user, profile?.role, cacheKey, logDataAccess, setLoading]);

  // Effect otimizado com cleanup
  useEffect(() => {
    fetchSolutions();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSolutions]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Implementar filtragem de soluções com memoização otimizada
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];

    let filtered = solutions;

    // Filtrar por categoria
    if (activeCategory !== "all") {
      filtered = filtered.filter(solution => 
        solution.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filtrar por termo de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(solution =>
        solution.title?.toLowerCase().includes(query) ||
        solution.description?.toLowerCase().includes(query) ||
        solution.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [solutions, activeCategory, searchQuery]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    solutionsCache.clear();
    fetchSolutions();
  }, [fetchSolutions]);

  return { 
    solutions,
    filteredSolutions,
    loading: false, // Loading agora controlado pelo LoadingContext
    error,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    canViewSolutions,
    invalidateCache
  };
};
