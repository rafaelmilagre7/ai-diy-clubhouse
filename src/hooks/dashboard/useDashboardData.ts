
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

export const useDashboardData = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const isAdmin = useMemo(() => 
    profile?.user_roles?.name === 'admin', 
    [profile?.user_roles?.name]
  );

  const fetchData = useCallback(async () => {
    if (!user?.id || !profile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let solutionsQuery = supabase.from("solutions").select("*");
      if (!isAdmin) {
        solutionsQuery = solutionsQuery.eq("published", true);
      }
      
      const { data: solutionsData, error: solutionsError } = await solutionsQuery;
      
      if (solutionsError) throw solutionsError;
      setSolutions(solutionsData || []);
      
    } catch (error: any) {
      console.error("Erro no carregamento de dados do dashboard:", error);
      setError(error.message || "Erro inesperado ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { 
    solutions, 
    loading, 
    error 
  };
};
