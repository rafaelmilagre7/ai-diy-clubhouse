
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useSecurityEnforcement } from "@/hooks/auth/useSecurityEnforcement";
import { logger } from "@/utils/logger";

export const useSolutionsData = () => {
  const { user, profile } = useAuth();
  const { logDataAccess } = useSecurityEnforcement();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // CORREÇÃO: Adicionar estados de busca e filtragem que estavam faltando
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // CORREÇÃO: Computar canViewSolutions baseado no usuário atual
  const canViewSolutions = useMemo(() => {
    return !!user; // Por enquanto, qualquer usuário autenticado pode ver soluções
  }, [user]);

  useEffect(() => {
    const fetchSolutions = async () => {
      // CORREÇÃO CRÍTICA: Verificar autenticação antes de qualquer operação
      if (!user) {
        logger.warn('[SOLUTIONS] Tentativa de carregar soluções sem autenticação');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Log de acesso a dados críticos usando a nova função implementada
        await logDataAccess('solutions', 'fetch_list');

        // CORREÇÃO CRÍTICA: Filtrar soluções baseado no perfil do usuário
        // As políticas RLS agora garantem que os filtros são aplicados no servidor
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

        // CORREÇÃO CRÍTICA: Validar dados antes de definir no estado
        const validSolutions = (data || []).filter(solution => 
          solution && typeof solution.id === 'string'
        );

        setSolutions(validSolutions);
        
        logger.info('[SOLUTIONS] Soluções carregadas com sucesso', {
          count: validSolutions.length,
          isAdmin: profile?.role === 'admin',
          userId: user.id.substring(0, 8) + '***'
        });

      } catch (error: any) {
        logger.error('[SOLUTIONS] Erro ao carregar soluções:', error);
        setError(error.message || "Erro ao carregar soluções");
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [user, profile, logDataAccess]);

  // CORREÇÃO: Implementar filtragem de soluções baseada na busca e categoria
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
