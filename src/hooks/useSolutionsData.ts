
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useSecurityEnforcement } from "@/hooks/auth/useSecurityEnforcement";
import { logger } from "@/utils/logger";
import { useOptimizedQuery } from "./cache/useOptimizedQueries";
import { fetchOptimizedSolutions, preloadRelatedSolutions } from "@/services/optimizedSolutionsService";

// Cache global otimizado - mantido para compatibilidade
const solutionsCache = new Map<string, { data: Solution[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useSolutionsData = () => {
  const { user, profile } = useAuth();
  const { logDataAccess } = useSecurityEnforcement();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Usar query otimizada para soluções
  const { 
    data: solutions = [], 
    isLoading: loading, 
    error: queryError 
  } = useOptimizedQuery(
    fetchOptimizedSolutions,
    {
      cacheType: 'solutions',
      enablePreload: true,
      enabled: !!user,
      onQuerySuccess: (data) => {
        // Preload das categorias mais comuns
        const categories = [...new Set(data.map(s => s.category))];
        categories.slice(0, 3).forEach(category => {
          if (typeof category === 'string') {
            preloadRelatedSolutions(category);
          }
        });
      }
    }
  );

  // Estados de compatibilidade
  const [error, setError] = useState<string | null>(null);
  
  // Atualizar erro baseado na query
  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : "Erro ao carregar soluções");
    } else {
      setError(null);
    }
  }, [queryError]);

  // Log de acesso otimizado
  useEffect(() => {
    if (solutions.length > 0 && user) {
      // Fazer log apenas uma vez por sessão
      const logKey = `solutions_access_${user.id}`;
      if (!sessionStorage.getItem(logKey)) {
        logDataAccess('solutions', 'fetch_list').catch(() => {
          // Ignorar erros de auditoria
        });
        sessionStorage.setItem(logKey, 'true');
      }
    }
  }, [solutions.length, user, logDataAccess]);

  // Computar canViewSolutions baseado no usuário atual
  const canViewSolutions = useMemo(() => {
    return !!user;
  }, [user]);

  // Implementar filtragem otimizada de soluções
  const filteredSolutions = useMemo(() => {
    let filtered = solutions;

    // Filtrar por categoria
    if (activeCategory !== "all") {
      filtered = filtered.filter(solution => 
        solution.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filtrar por termo de busca com debounce implícito
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

  // Debug em desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && solutions.length > 0) {
      console.log('[SOLUTIONS_OPTIMIZED] Soluções carregadas:', {
        total: solutions.length,
        filtered: filteredSolutions.length,
        category: activeCategory,
        searchQuery: searchQuery ? searchQuery.substring(0, 20) + '...' : 'none'
      });
    }
  }, [solutions.length, filteredSolutions.length, activeCategory, searchQuery]);

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
