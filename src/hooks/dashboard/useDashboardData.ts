
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

export const useDashboardData = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [profilesData, setProfilesData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Memoizar isAdmin para evitar re-computações
  const isAdmin = useMemo(() => 
    profile?.user_roles?.name === 'admin', 
    [profile?.user_roles?.name]
  );

  const fetchData = useCallback(async () => {
    if (!user?.id || !profile) return;
    
    let timeoutId: number;
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 [DASHBOARD] Iniciando carregamento de dados...');

      // Timeout de 8 segundos para carregamento
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error('Timeout no carregamento do dashboard'));
        }, 8000);
      });
      
      // Batch queries para melhor performance
      const queries = [];
      
      // Query solutions com filtro otimizado
      let solutionsQuery = supabase.from("solutions").select("*");
      if (!isAdmin) {
        solutionsQuery = solutionsQuery.eq("published", true);
      }
      queries.push(solutionsQuery);
      
      // Query progress
      queries.push(
        supabase.from("progress").select("*").limit(100)
      );
      
      // Query analytics
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
      const dataPromise = Promise.allSettled(queries);
      const results = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      // Limpar timeout se chegou aqui
      clearTimeout(timeoutId);
      
      // Processar resultados
      const [solutionsResult, progressResult, analyticsResult, profilesResult] = results;
      
      if (solutionsResult.status === 'fulfilled' && !solutionsResult.value.error) {
        setSolutions(solutionsResult.value.data as Solution[]);
      }
      
      if (progressResult.status === 'fulfilled' && !progressResult.value.error) {
        setProgressData(progressResult.value.data || []);
      }
      
      if (analyticsResult.status === 'fulfilled' && !analyticsResult.value.error) {
        setAnalyticsData(analyticsResult.value.data || []);
      }
      
      if (profilesResult && profilesResult.status === 'fulfilled' && !profilesResult.value.error) {
        setProfilesData(profilesResult.value.data || []);
      }
      
      console.log('✅ [DASHBOARD] Dados carregados com sucesso');
      
    } catch (error: any) {
      console.warn('⚠️ [DASHBOARD] Erro no carregamento:', error.message);
      setError(error.message || "Erro inesperado ao carregar dados");
      // Circuit breaker: se houver muito erro, parar tentativas
      clearTimeout(timeoutId);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile, isAdmin]);

  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      console.log('🔄 [DASHBOARD] Iniciando fetch de dados...');
      fetchData();
    }

    return () => {
      mounted = false;
    };
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
