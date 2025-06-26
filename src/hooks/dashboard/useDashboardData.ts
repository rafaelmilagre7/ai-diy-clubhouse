
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch solutions - filtrar apenas publicadas se não for admin
        let query = supabase.from("solutions").select("*");
        if (!isAdmin) {
          query = query.eq("published", true as any);
        }
        
        const { data: solutionsData, error: solutionsError } = await query;
        
        if (solutionsError) {
          throw solutionsError;
        }
        
        setSolutions(solutionsData as any);
        
        // Fetch all progress data
        const { data: progress, error: progressError } = await supabase
          .from("progress")
          .select("*");
        
        if (progressError) {
          throw progressError;
        }
        
        setProgressData(progress || []);
        
        // Fetch analytics data
        const { data: analytics, error: analyticsError } = await supabase
          .from("analytics")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        
        if (analyticsError && !analyticsError.message.includes('does not exist')) {
          console.error('Analytics error:', analyticsError);
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
        
        setProfilesData(profiles || []);
        
      } catch (error: any) {
        console.error("Dashboard data error:", error);
        const errorMessage = error.message || "Erro inesperado ao carregar dados";
        setError(errorMessage);
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
