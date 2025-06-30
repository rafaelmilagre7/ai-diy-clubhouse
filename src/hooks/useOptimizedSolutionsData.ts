
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";

// Cache global otimizado
const solutionsCache = new Map<string, { data: Solution[], timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos

export const useOptimizedSolutionsData = () => {
  const { user, profile } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  
  // Estados de busca e filtragem
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Verificação de permissões otimizada
  const canViewSolutions = useMemo(() => !!user, [user]);

  // Chave de cache baseada no perfil
  const cacheKey = useMemo(() => {
    const isAdmin = profile?.role === 'admin';
    return `solutions_${user?.id}_${isAdmin ? 'admin' : 'user'}`;
  }, [user?.id, profile?.role]);
  
  // Função de busca otimizada
  const fetchSolutions = useCallback(async () => {
    if (!user?.id) {
      logger.warn('[OPTIMIZED_SOLUTIONS] Tentativa sem autenticação');
      setLoading(false);
      return;
    }

    // Debounce
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    // Verificar cache
    const cached = solutionsCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      setSolutions(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query otimizada com campos específicos
      let query = supabase
        .from("solutions")
        .select(`
          id,
          title,
          description,
          category,
          difficulty,
          published,
          thumbnail_url,
          slug,
          created_at,
          updated_at
        `);

      // Filtrar por publicação se não for admin
      if (!profile || profile.role !== 'admin') {
        query = query.eq("published", true);
      }

      const { data, error: fetchError } = await query
        .order("created_at", { ascending: false });

      if (fetchError) {
        logger.error('[OPTIMIZED_SOLUTIONS] Erro na query:', fetchError);
        throw fetchError;
      }

      // Processar e validar dados
      const validSolutions = (data || [])
        .filter(solution => solution && typeof solution.id === 'string')
        .map(solution => ({
          ...solution,
          // Garantir campos obrigatórios com fallbacks apropriados
          slug: solution.slug || `${solution.title?.toLowerCase().replace(/\s+/g, '-') || 'solucao'}-${solution.id}`,
          category: solution.category || 'Operacional',
          difficulty: solution.difficulty || 'medium',
          description: solution.description || '',
          thumbnail_url: solution.thumbnail_url || null
        }));

      // Atualizar cache
      solutionsCache.set(cacheKey, {
        data: validSolutions,
        timestamp: now
      });

      setSolutions(validSolutions);
      
      logger.info('[OPTIMIZED_SOLUTIONS] Soluções carregadas:', {
        count: validSolutions.length,
        published: validSolutions.filter(s => s.published).length,
        isAdmin: profile?.role === 'admin'
      });

    } catch (error: any) {
      logger.error('[OPTIMIZED_SOLUTIONS] Erro:', error);
      setError(error.message || "Erro ao carregar soluções");
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role, cacheKey]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // Filtragem otimizada com memoização
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
    canViewSolutions,
    // Métodos de conveniência
    refreshSolutions: fetchSolutions
  };
};
