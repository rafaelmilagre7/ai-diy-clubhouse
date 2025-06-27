
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

  console.log('[DASHBOARD-DATA] Inicializando hook:', {
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    userId: user?.id?.substring(0, 8)
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log('[DASHBOARD-DATA] Sem usuário, não carregando dados');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('[DASHBOARD-DATA] Iniciando carregamento de dados...');
        
        // Fetch solutions - filtrar apenas publicadas se não for admin
        let query = supabase.from("solutions").select("*");
        if (!isAdmin) {
          query = query.eq("published", true as any);
        }
        
        const { data: solutionsData, error: solutionsError } = await query;
        
        if (solutionsError) {
          throw solutionsError;
        }
        
        console.log('[DASHBOARD-DATA] Soluções carregadas:', solutionsData?.length || 0);
        
        // Ensure solutions array is type-safe
        setSolutions(solutionsData as any);
        
        // Fetch all progress data
        const { data: progress, error: progressError } = await supabase
          .from("progress")
          .select("*");
        
        if (progressError) {
          throw progressError;
        }
        
        console.log('[DASHBOARD-DATA] Progresso carregado:', progress?.length || 0);
        setProgressData(progress || []);
        
        // Fetch analytics data
        const { data: analytics, error: analyticsError } = await supabase
          .from("analytics")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        
        if (analyticsError && !analyticsError.message.includes('does not exist')) {
          console.warn("Erro ao buscar analytics:", analyticsError);
        } else {
          setAnalyticsData(analytics || []);
        }
        
        // Fetch profiles data
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          throw profilesError;
        }
        
        console.log('[DASHBOARD-DATA] Perfis carregados:', profiles?.length || 0);
        setProfilesData(profiles || []);
        
        console.log('[DASHBOARD-DATA] Todos os dados carregados com sucesso');
        
      } catch (error: any) {
        console.error("Erro no carregamento de dados do dashboard:", error);
        setError(error.message || "Erro inesperado ao carregar dados");
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados do dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
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
