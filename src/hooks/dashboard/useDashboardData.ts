
import { useState, useEffect } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";
import { getUserRoleName } from "@/lib/supabase/types";

export const useDashboardData = () => {
  const { user, profile } = useSimpleAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [profilesData, setProfilesData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = getUserRoleName(profile) === 'admin';

  console.log('[DEBUG-DASHBOARD-DATA] 🎬 Inicializando hook:', {
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    userId: user?.id?.substring(0, 8) + '***'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log('[DEBUG-DASHBOARD-DATA] ❌ Sem usuário, não carregando dados');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('[DEBUG-DASHBOARD-DATA] 🚀 Iniciando carregamento de dados...');
        
        // Fetch solutions - filtrar apenas publicadas se não for admin
        console.log('[DEBUG-DASHBOARD-DATA] 📋 Carregando soluções...');
        let query = supabase.from("solutions").select("*");
        if (!isAdmin) {
          query = query.eq("published", true as any);
        }
        
        const { data: solutionsData, error: solutionsError } = await query;
        
        if (solutionsError) {
          console.error('[DEBUG-DASHBOARD-DATA] ❌ Erro ao carregar soluções:', solutionsError);
          throw solutionsError;
        }
        
        console.log('[DEBUG-DASHBOARD-DATA] ✅ Soluções carregadas:', {
          count: solutionsData?.length || 0,
          isAdmin,
          firstSolution: solutionsData?.[0]?.title
        });
        
        setSolutions(solutionsData as any);
        
        // Fetch all progress data
        console.log('[DEBUG-DASHBOARD-DATA] 📈 Carregando progresso...');
        const { data: progress, error: progressError } = await supabase
          .from("progress")
          .select("*");
        
        if (progressError) {
          console.error('[DEBUG-DASHBOARD-DATA] ❌ Erro ao carregar progresso:', progressError);
          throw progressError;
        }
        
        console.log('[DEBUG-DASHBOARD-DATA] ✅ Progresso carregado:', {
          count: progress?.length || 0
        });
        setProgressData(progress || []);
        
        // Fetch analytics data
        console.log('[DEBUG-DASHBOARD-DATA] 📊 Carregando analytics...');
        const { data: analytics, error: analyticsError } = await supabase
          .from("analytics")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        
        if (analyticsError && !analyticsError.message.includes('does not exist')) {
          console.error('[DEBUG-DASHBOARD-DATA] ⚠️ Erro ao carregar analytics:', analyticsError);
        } else {
          console.log('[DEBUG-DASHBOARD-DATA] ✅ Analytics carregado:', {
            count: analytics?.length || 0
          });
          setAnalyticsData(analytics || []);
        }
        
        // Fetch profiles data
        console.log('[DEBUG-DASHBOARD-DATA] 👥 Carregando perfis...');
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          console.error('[DEBUG-DASHBOARD-DATA] ❌ Erro ao carregar perfis:', profilesError);
          throw profilesError;
        }
        
        console.log('[DEBUG-DASHBOARD-DATA] ✅ Perfis carregados:', {
          count: profiles?.length || 0
        });
        setProfilesData(profiles || []);
        
        console.log('[DEBUG-DASHBOARD-DATA] 🎉 Todos os dados carregados com sucesso');
        
      } catch (error: any) {
        console.error("[DEBUG-DASHBOARD-DATA] 💥 Erro no carregamento de dados:", error);
        const errorMessage = error.message || "Erro inesperado ao carregar dados";
        setError(errorMessage);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados do dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        console.log('[DEBUG-DASHBOARD-DATA] 🏁 Carregamento finalizado');
      }
    };
    
    fetchData();
  }, [toast, isAdmin, user?.id]);
  
  return { 
    solutions, 
    progressData, 
    analyticsData,
    profilesData,
    loading, 
    error 
  };
};
