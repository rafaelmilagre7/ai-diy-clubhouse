
import { useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { useOptimizedQuery } from "@/hooks/common/useOptimizedQuery";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

/**
 * Hook otimizado para dados do dashboard
 * Remove lógica desnecessária e melhora cache
 */
export const useOptimizedDashboardData = () => {
  const { profile } = useAuth();
  
  const isAdmin = useMemo(() => 
    profile?.role === 'admin', 
    [profile?.role]
  );

  // Fetch solutions com cache otimizado
  const { 
    data: solutions = [], 
    isLoading: solutionsLoading, 
    error: solutionsError 
  } = useOptimizedQuery({
    queryKey: ['solutions', isAdmin],
    queryFn: async () => {
      let query = supabase.from("solutions").select("*");
      if (!isAdmin) {
        query = query.eq("published", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Solution[];
    },
    enabled: !!profile
  });

  // Fetch progress data com cache otimizado
  const { 
    data: progressData = [], 
    isLoading: progressLoading 
  } = useOptimizedQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progress")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile
  });

  // Fetch profiles data com cache otimizado
  const { 
    data: profilesData = [], 
    isLoading: profilesLoading 
  } = useOptimizedQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile
  });

  return {
    solutions,
    progressData,
    profilesData,
    loading: solutionsLoading || progressLoading || profilesLoading,
    error: solutionsError
  };
};
