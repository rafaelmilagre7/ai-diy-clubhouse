
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

export const useDashboardData = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 [DASHBOARD-DATA] Estado:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    solutionsCount: solutions.length
  });

  const fetchData = useCallback(async () => {
    if (!user || !profile) {
      console.log('⏳ [DASHBOARD-DATA] Aguardando user/profile...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [DASHBOARD-DATA] Buscando solutions...');

      // Query simples para solutions
      const isAdmin = profile?.user_roles?.name === 'admin';
      let query = supabase.from("solutions").select("*");
      
      if (!isAdmin) {
        query = query.eq("published", true);
      }

      const { data, error: solutionsError } = await query;

      if (solutionsError) {
        throw solutionsError;
      }

      console.log('✅ [DASHBOARD-DATA] Solutions carregadas:', data?.length || 0);
      setSolutions(data || []);
      
    } catch (error: any) {
      console.error("❌ [DASHBOARD-DATA] Erro:", error);
      setError(error.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { 
    solutions, 
    loading, 
    error 
  };
};
