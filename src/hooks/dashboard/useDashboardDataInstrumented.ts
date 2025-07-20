
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";
import { perfMonitor, measureAsync } from "@/utils/performanceMonitor";

export const useDashboardData = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [profilesData, setProfilesData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Métricas de diagnóstico
  const [hookStartTime] = useState(() => performance.now());
  
  // Memoizar isAdmin para evitar re-computações
  const isAdmin = React.useMemo(() => {
    const result = profile?.user_roles?.name === 'admin';
    perfMonitor.logEvent('useDashboardData', 'isAdmin_computed', { isAdmin: result });
    return result;
  }, [profile?.user_roles?.name]);
  
  // Debounce para evitar fetches excessivos
  const [debouncedUserId, setDebouncedUserId] = useState(user?.id);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserId(user?.id);
      perfMonitor.logEvent('useDashboardData', 'userId_debounced', { userId: user?.id });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user?.id]);

  const fetchData = React.useCallback(async () => {
    if (!debouncedUserId || !profile) {
      perfMonitor.logEvent('useDashboardData', 'fetch_skipped', { 
        hasUserId: !!debouncedUserId, 
        hasProfile: !!profile 
      });
      return;
    }
    
    perfMonitor.startTimer('useDashboardData', 'fetchData', {
      userId: debouncedUserId,
      isAdmin,
      profileRole: profile?.user_roles?.name
    });
    
    try {
      setLoading(true);
      setError(null);
      
      // Batch queries para melhor performance
      const queries = [];
      
      perfMonitor.logEvent('useDashboardData', 'building_queries', { isAdmin });
      
      // Query solutions com filtro otimizado
      let solutionsQuery = supabase.from("solutions").select("*");
      if (!isAdmin) {
        solutionsQuery = solutionsQuery.eq("published", true);
      }
      queries.push({
        name: 'solutions',
        query: solutionsQuery
      });
      
      // Query progress apenas se necessário
      queries.push({
        name: 'progress',
        query: supabase.from("progress").select("*").limit(100)
      });
      
      // Query analytics com timeout
      queries.push({
        name: 'analytics',
        query: supabase
          .from("analytics")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)
      });
      
      // Query profiles apenas para admin
      if (isAdmin) {
        queries.push({
          name: 'profiles',
          query: supabase.from("profiles").select("*").limit(50)
        });
      }
      
      perfMonitor.logEvent('useDashboardData', 'executing_queries', { 
        queryCount: queries.length,
        queryNames: queries.map(q => q.name)
      });
      
      // Executar queries em paralelo com medição individual
      const results = await Promise.allSettled(
        queries.map(async ({ name, query }) => {
          const result = await measureAsync(
            'useDashboardData',
            `query_${name}`,
            () => query,
            { queryName: name, isAdmin }
          );
          return { name, result };
        })
      );
      
      // Processar resultados
      results.forEach((result, index) => {
        const queryName = queries[index].name;
        
        if (result.status === 'fulfilled') {
          const { name, result: queryResult } = result.value;
          
          if (!queryResult.error) {
            perfMonitor.logEvent('useDashboardData', `${name}_success`, { 
              dataCount: queryResult.data?.length || 0 
            });
            
            switch (name) {
              case 'solutions':
                setSolutions(queryResult.data as Solution[]);
                break;
              case 'progress':
                setProgressData(queryResult.data || []);
                break;
              case 'analytics':
                setAnalyticsData(queryResult.data || []);
                break;
              case 'profiles':
                setProfilesData(queryResult.data || []);
                break;
            }
          } else {
            perfMonitor.logEvent('useDashboardData', `${name}_error`, { 
              error: queryResult.error.message 
            });
          }
        } else {
          perfMonitor.logEvent('useDashboardData', `${queryName}_rejected`, { 
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
      
    } catch (error: any) {
      console.error("Erro no carregamento de dados do dashboard:", error);
      setError(error.message || "Erro inesperado ao carregar dados");
      
      perfMonitor.logEvent('useDashboardData', 'fetch_error', {
        error: error.message || 'Unknown error',
        userId: debouncedUserId
      });
    } finally {
      setLoading(false);
      perfMonitor.endTimer('useDashboardData', 'fetchData', {
        hasError: !!error,
        solutionsCount: solutions.length,
        totalTime: performance.now() - hookStartTime
      });
    }
  }, [debouncedUserId, profile, isAdmin]);

  useEffect(() => {
    perfMonitor.logEvent('useDashboardData', 'effect_triggered', {
      userId: debouncedUserId,
      hasProfile: !!profile
    });
    
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
