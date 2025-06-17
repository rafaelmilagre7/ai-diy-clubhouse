
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useRLSSecurityManager } from "@/hooks/useRLSSecurityManager";
import { logger } from "@/utils/logger";

// Cache global para evitar requests desnecessários
const solutionsCache = new Map<string, { data: Solution[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useSolutionsData = () => {
  const { user, profile } = useAuth();
  const { logSecureAccess } = useRLSSecurityManager();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const executionCountRef = useRef(0);
  
  // Estados de busca e filtragem
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Computar canViewSolutions baseado no usuário atual
  const canViewSolutions = useMemo(() => {
    return !!user;
  }, [user]);

  // Chave de cache baseada no perfil do usuário
  const cacheKey = useMemo(() => {
    const isAdmin = profile?.role === 'admin';
    return `solutions_${user?.id}_${isAdmin ? 'admin' : 'user'}`;
  }, [user?.id, profile?.role]);

  useEffect(() => {
    const fetchSolutions = async () => {
      // Verificar autenticação
      if (!user) {
        logger.warn('[SOLUTIONS] Tentativa de carregar soluções sem autenticação');
        setLoading(false);
        return;
      }

      // Incrementar contador apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        executionCountRef.current++;
      }

      // Debounce: evitar múltiplas execuções em sequência
      const now = Date.now();
      if (now - lastFetchRef.current < 1000) { // 1 segundo de debounce
        return;
      }
      lastFetchRef.current = now;

      // Verificar cache primeiro
      const cached = solutionsCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        setSolutions(cached.data);
        setLoading(false);
        setError(null);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[SOLUTIONS] Dados carregados do cache:', {
            execCount: executionCountRef.current,
            count: cached.data.length,
            cacheAge: Math.round((now - cached.timestamp) / 1000) + 's'
          });
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Log de acesso seguro
        await logSecureAccess('solutions', 'fetch_list');

        // Query otimizada com RLS habilitado
        let query = supabase.from("solutions").select("*");

        // Se não for admin, mostrar apenas soluções publicadas
        if (!profile || profile.role !== 'admin') {
          query = query.eq("published", true);
        }

        const { data, error: fetchError } = await query.order("created_at", { ascending: false });

        if (fetchError) {
          logger.error('[SOLUTIONS] Erro ao buscar soluções:', fetchError);
          throw fetchError;
        }

        // Validar dados antes de definir no estado
        const validSolutions = (data || []).filter(solution => 
          solution && typeof solution.id === 'string'
        );

        // Atualizar cache
        solutionsCache.set(cacheKey, {
          data: validSolutions,
          timestamp: now
        });

        setSolutions(validSolutions);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[SOLUTIONS] Soluções carregadas do servidor:', {
            execCount: executionCountRef.current,
            count: validSolutions.length,
            isAdmin: profile?.role === 'admin',
            userId: user.id.substring(0, 8) + '***'
          });
        }

      } catch (error: any) {
        logger.error('[SOLUTIONS] Erro ao carregar soluções:', error);
        setError(error.message || "Erro ao carregar soluções");
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [user, profile?.role, cacheKey, logSecureAccess]); // Dependências mínimas

  // Implementar filtragem de soluções baseada na busca e categoria
  const filteredSolutions = useMemo(() => {
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

  return { 
    solutions,
    filteredSolutions,
    loading, 
    error,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    canViewSolutions
  };
};
