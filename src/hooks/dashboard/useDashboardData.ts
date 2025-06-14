
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";
import { useOptimizedQuery } from "../cache/useOptimizedQueries";
import { fetchOptimizedSolutions } from "@/services/optimizedSolutionsService";
import { fetchUserProgress } from "@/services/optimizedProgressService";

export const useDashboardData = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [profilesData, setProfilesData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = profile?.role === 'admin';

  // Query otimizada para soluções
  const { 
    data: solutions = [], 
    isLoading: solutionsLoading 
  } = useOptimizedQuery(
    fetchOptimizedSolutions,
    {
      cacheType: 'solutions',
      enabled: !!user
    }
  );

  // Query otimizada para progresso
  const { 
    data: progressData = [], 
    isLoading: progressLoading 
  } = useOptimizedQuery(
    () => fetchUserProgress(user?.id),
    {
      cacheType: 'progress',
      identifier: user?.id,
      enabled: !!user
    }
  );

  // Loading consolidado
  const loading = solutionsLoading || progressLoading;

  // Fetch dados complementares (menos críticos)
  useEffect(() => {
    const fetchComplementaryData = async () => {
      if (!user) return;

      try {
        setError(null);
        
        // Analytics data (não crítico)
        try {
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
        } catch (analyticsErr) {
          console.warn("Analytics fetch error:", analyticsErr);
        }
        
        // Profiles data (admin only)
        if (isAdmin) {
          try {
            const { data: profiles, error: profilesError } = await supabase
              .from("profiles")
              .select("id, name, email, role, created_at")
              .limit(100);
            
            if (profilesError) {
              console.warn("Erro ao buscar profiles:", profilesError);
            } else {
              setProfilesData(profiles || []);
            }
          } catch (profilesErr) {
            console.warn("Profiles fetch error:", profilesErr);
          }
        }
        
      } catch (error: any) {
        console.error("Erro no carregamento de dados complementares:", error);
        setError(error.message || "Erro inesperado ao carregar dados");
      }
    };
    
    // Delay para não impactar carregamento crítico
    const timer = setTimeout(fetchComplementaryData, 1000);
    return () => clearTimeout(timer);
  }, [user, isAdmin]);

  // Toast de erro apenas para erros críticos
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Alguns dados complementares podem não estar disponíveis.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  return { 
    solutions, 
    progressData, 
    analyticsData,
    profilesData,
    loading, 
    error 
  };
};
