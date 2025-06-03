
import { useMemo } from "react";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { useOptimizedQuery } from "@/hooks/common/useOptimizedQuery";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

/**
 * Hook otimizado para dados do dashboard
 * Remove lógica desnecessária e melhora cache
 */
export const useOptimizedDashboardData = () => {
  const { profile, isAdmin } = useOptimizedAuth();
  
  console.log("useOptimizedDashboardData: Iniciando com profile:", !!profile, "isAdmin:", isAdmin);

  // Fetch solutions com cache otimizado
  const { 
    data: solutions = [], 
    isLoading: solutionsLoading, 
    error: solutionsError 
  } = useOptimizedQuery({
    queryKey: ['solutions', isAdmin],
    queryFn: async () => {
      console.log("useOptimizedDashboardData: Buscando soluções");
      let query = supabase.from("solutions").select("*");
      if (!isAdmin) {
        query = query.eq("published", true);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error("useOptimizedDashboardData: Erro ao buscar soluções:", error);
        throw error;
      }
      console.log("useOptimizedDashboardData: Soluções carregadas:", data?.length || 0);
      return data as Solution[];
    },
    enabled: !!profile // Só busca quando tem profile
  });

  // Fetch progress data com cache otimizado
  const { 
    data: progressData = [], 
    isLoading: progressLoading 
  } = useOptimizedQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      console.log("useOptimizedDashboardData: Buscando progresso");
      const { data, error } = await supabase
        .from("progress")
        .select("*");
      
      if (error) {
        console.error("useOptimizedDashboardData: Erro ao buscar progresso:", error);
        throw error;
      }
      console.log("useOptimizedDashboardData: Progresso carregado:", data?.length || 0);
      return data || [];
    },
    enabled: !!profile // Só busca quando tem profile
  });

  // Fetch profiles data com cache otimizado  
  const { 
    data: profilesData = [], 
    isLoading: profilesLoading 
  } = useOptimizedQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log("useOptimizedDashboardData: Buscando perfis");
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) {
        console.error("useOptimizedDashboardData: Erro ao buscar perfis:", error);
        throw error;
      }
      console.log("useOptimizedDashboardData: Perfis carregados:", data?.length || 0);
      return data || [];
    },
    enabled: !!profile // Só busca quando tem profile
  });

  const loading = useMemo(() => 
    solutionsLoading || progressLoading || profilesLoading,
    [solutionsLoading, progressLoading, profilesLoading]
  );

  console.log("useOptimizedDashboardData: Estado final:", {
    solutions: solutions.length,
    loading,
    hasError: !!solutionsError
  });

  return {
    solutions,
    progressData,
    profilesData,
    loading,
    error: solutionsError
  };
};
