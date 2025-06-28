
import { useState, useEffect } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useUserStatsData = () => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStatsData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all published solutions - simplified query
        const { data: solutionsData, error: solutionsError } = await supabase
          .from("solutions")
          .select("id, category, difficulty_level")
          .eq("published", true);

        if (solutionsError) {
          throw new Error(`Error fetching solutions: ${solutionsError.message}`);
        }

        // Set empty arrays for now to avoid complex type issues
        setSolutions(solutionsData || []);
        setProgressData([]);
        setAnalyticsData([]);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar estatísticas');
        console.error('Error fetching user stats data:', err);
        toast({
          title: "Erro ao carregar estatísticas",
          description: "Não foi possível carregar seus dados estatísticos.",
          variant: "destructive",
        });
        
        // Set empty arrays on error
        setSolutions([]);
        setProgressData([]);
        setAnalyticsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatsData();
  }, [user, toast]);

  return {
    solutions,
    progressData,
    analyticsData,
    loading,
    error
  };
};
