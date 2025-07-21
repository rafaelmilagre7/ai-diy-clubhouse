
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
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando carregamento de dados do dashboard...');
      
      // Query solutions com filtro otimizado e tratamento defensivo
      let solutionsQuery = supabase.from("solutions").select("*");
      if (!isAdmin) {
        solutionsQuery = solutionsQuery.eq("published", true);
      }
      
      const { data: solutionsData, error: solutionsError } = await solutionsQuery;
      
      if (solutionsError) {
        console.error('❌ Erro ao carregar soluções:', solutionsError);
        throw solutionsError;
      }
      
      // Garantir que as soluções tenham estrutura básica necessária
      const processedSolutions = (solutionsData || []).map(solution => ({
        ...solution,
        implementation_steps: solution.implementation_steps || [],
        checklist_items: solution.checklist_items || solution.checklist || [],
        completion_requirements: solution.completion_requirements || []
      }));
      
      console.log(`✅ Carregadas ${processedSolutions.length} soluções`);
      setSolutions(processedSolutions);
      
      // Query progress com timeout e fallback
      try {
        const { data: progressResult, error: progressError } = await Promise.race([
          supabase.from("progress").select("*").limit(100),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao carregar progresso')), 5000)
          )
        ]) as any;
        
        if (progressError) {
          console.warn('⚠️ Erro ao carregar progresso:', progressError);
          setProgressData([]);
        } else {
          setProgressData(progressResult || []);
          console.log(`✅ Carregados ${(progressResult || []).length} registros de progresso`);
        }
      } catch (error) {
        console.warn('⚠️ Timeout ou erro no progresso, continuando sem dados:', error);
        setProgressData([]);
      }
      
      // Query analytics com timeout e fallback
      try {
        const { data: analyticsResult, error: analyticsError } = await Promise.race([
          supabase
            .from("analytics")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao carregar analytics')), 5000)
          )
        ]) as any;
        
        if (analyticsError) {
          console.warn('⚠️ Erro ao carregar analytics:', analyticsError);
          setAnalyticsData([]);
        } else {
          setAnalyticsData(analyticsResult || []);
          console.log(`✅ Carregados ${(analyticsResult || []).length} registros de analytics`);
        }
      } catch (error) {
        console.warn('⚠️ Timeout ou erro no analytics, continuando sem dados:', error);
        setAnalyticsData([]);
      }
      
      // Query profiles apenas para admin com timeout
      if (isAdmin) {
        try {
          const { data: profilesResult, error: profilesError } = await Promise.race([
            supabase.from("profiles").select("*").limit(50),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout ao carregar perfis')), 5000)
            )
          ]) as any;
          
          if (profilesError) {
            console.warn('⚠️ Erro ao carregar perfis:', profilesError);
            setProfilesData([]);
          } else {
            setProfilesData(profilesResult || []);
            console.log(`✅ Carregados ${(profilesResult || []).length} perfis`);
          }
        } catch (error) {
          console.warn('⚠️ Timeout ou erro nos perfis, continuando sem dados:', error);
          setProfilesData([]);
        }
      }
      
      console.log('✅ Dashboard carregado com sucesso');
      
    } catch (error: any) {
      console.error("❌ Erro crítico no carregamento de dados do dashboard:", error);
      setError(error.message || "Erro inesperado ao carregar dados");
      
      // Em caso de erro, garantir que pelo menos temos arrays vazios
      setSolutions([]);
      setProgressData([]);
      setAnalyticsData([]);
      setProfilesData([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { 
    solutions, 
    progressData, 
    analyticsData,
    profilesData,
    loading, 
    error,
    refetch: fetchData
  };
};
