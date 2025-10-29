
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { Solution } from "@/lib/supabase";
import { perfMonitor, measureAsync } from '@/utils/performanceMonitor';

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

export const useDashboardData = () => {
  const { user, profile } = useAuth();
  const { showError } = useToastModern();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [profilesData, setProfilesData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Memoizar isAdmin para evitar re-computações
  const isAdmin = React.useMemo(() => 
    profile?.user_roles?.name === 'admin', 
    [profile?.user_roles?.name]
  );
  
  // Debounce para evitar fetches excessivos
  const [debouncedUserId, setDebouncedUserId] = useState(user?.id);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserId(user?.id);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user?.id]);

  const fetchData = React.useCallback(async () => {
    if (!debouncedUserId || !profile) return;
    
    try {
      perfMonitor.startTimer('useDashboardData', 'fetchData', { userId: debouncedUserId, isAdmin });
      setLoading(true);
      setError(null);
      
      // Batch queries para melhor performance
      const queries = [];
      
      // Query solutions com filtro otimizado
      let solutionsQuery = supabase.from("solutions").select("*");
      if (!isAdmin) {
        solutionsQuery = solutionsQuery.eq("published", true);
      }
      queries.push(solutionsQuery);
      
      // Query progress apenas se necessário
      queries.push(
        supabase.from("progress").select("*").limit(100)
      );
      
      // Query analytics com timeout
      queries.push(
        supabase
          .from("analytics")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)
      );
      
      // Query profiles apenas para admin
      if (isAdmin) {
        queries.push(supabase.from("profiles").select("*").limit(50));
      }
      
      // Executar queries em paralelo com timeout
      const results = await measureAsync(
        'useDashboardData',
        'parallelQueries',
        () => Promise.allSettled(queries),
        { queryCount: queries.length, isAdmin }
      );
      
      // Processar resultados
      const [solutionsResult, progressResult, analyticsResult, profilesResult] = results as PromiseSettledResult<SupabaseResponse<any>>[];
      
      if (solutionsResult.status === 'fulfilled' && !solutionsResult.value.error) {
        setSolutions(solutionsResult.value.data as Solution[]);
      }
      
      if (progressResult.status === 'fulfilled' && !progressResult.value.error) {
        setProgressData(progressResult.value.data || []);
      }
      
      if (analyticsResult.status === 'fulfilled' && !analyticsResult.value.error) {
        setAnalyticsData(analyticsResult.value.data || []);
      }
      
      if (profilesResult && profilesResult.status === 'fulfilled' && !(profilesResult.value as SupabaseResponse<any>).error) {
        setProfilesData((profilesResult.value as SupabaseResponse<any>).data || []);
      }
      
      perfMonitor.endTimer('useDashboardData', 'fetchData', { 
        userId: debouncedUserId, 
        isAdmin, 
        success: true,
        solutionsCount: solutions.length,
        progressCount: progressData.length
      });
      
    } catch (error: any) {
      console.error("Erro no carregamento de dados do dashboard:", error);
      setError(error.message || "Erro inesperado ao carregar dados");
      
      perfMonitor.endTimer('useDashboardData', 'fetchData', { 
        userId: debouncedUserId, 
        isAdmin, 
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedUserId, profile, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { 
    solutions, 
    progressData, 
    analyticsData,
    profilesData,
    loading, 
    error 
  };
};
