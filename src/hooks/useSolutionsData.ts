
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";

interface SimpleSolution {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_time_hours: number;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
}

// Cache global para evitar requests desnecessários
const solutionsCache = new Map<string, { data: SimpleSolution[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useSolutionsData = () => {
  const { user, profile } = useSimpleAuth();
  const [solutions, setSolutions] = useState<SimpleSolution[]>([]);
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
    const isAdmin = profile?.user_roles?.name === 'admin';
    return `solutions_${user?.id}_${isAdmin ? 'admin' : 'user'}`;
  }, [user?.id, profile?.user_roles?.name]);

  useEffect(() => {
    const fetchSolutions = async () => {
      // Verificar autenticação
      if (!user) {
        console.warn('[SOLUTIONS] Tentativa de carregar soluções sem autenticação');
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

        // Query otimizada com apenas campos necessários
        let query = supabase
          .from("solutions")
          .select("id, title, description, category, estimated_time_hours, cover_image_url, created_at, updated_at, published");

        // Se não for admin, mostrar apenas soluções publicadas
        if (!profile || profile.user_roles?.name !== 'admin') {
          query = query.eq("published", true);
        }

        const { data, error: fetchError } = await query.order("created_at", { ascending: false });

        if (fetchError) {
          console.error('[SOLUTIONS] Erro ao buscar soluções:', fetchError);
          throw fetchError;
        }

        // Transformar dados para SimpleSolution
        const validSolutions: SimpleSolution[] = (data || []).map(solution => ({
          id: solution.id,
          title: solution.title,
          description: solution.description,
          category: solution.category,
          estimated_time_hours: solution.estimated_time_hours,
          cover_image_url: solution.cover_image_url,
          created_at: solution.created_at,
          updated_at: solution.updated_at,
          published: solution.published
        }));

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
            isAdmin: profile?.user_roles?.name === 'admin',
            userId: user.id.substring(0, 8) + '***'
          });
        }

      } catch (error: any) {
        console.error('[SOLUTIONS] Erro ao carregar soluções:', error);
        setError(error.message || "Erro ao carregar soluções");
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [user, profile?.user_roles?.name, cacheKey]); // Dependências mínimas

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
