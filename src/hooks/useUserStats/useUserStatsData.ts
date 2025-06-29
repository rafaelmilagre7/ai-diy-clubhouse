
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useUserStatsData = () => {
  const { user } = useAuth();
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

        // Fetch all published solutions
        const { data: solutionsData, error: solutionsError } = await supabase
          .from("solutions")
          .select("id, category, difficulty")
          .eq("published", true);

        if (solutionsError) {
          throw new Error(`Error fetching solutions: ${solutionsError.message}`);
        }

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id);

        if (progressError) {
          throw new Error(`Error fetching progress: ${progressError.message}`);
        }

        // Optional: Fetch analytics data 
        const { data: analyticsData, error: analyticsError } = await supabase
          .from("analytics")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (analyticsError && !analyticsError.message.includes("does not exist")) {
          console.warn("Analytics data could not be fetched:", analyticsError.message);
        }

        // Update state with fetched data
        setSolutions(solutionsData || []);
        setProgressData(progressData || []);
        setAnalyticsData(analyticsData || []);
      } catch (err: any) {
        console.error("Error fetching user stats data:", err);
        setError(err.message || "An unknown error occurred");
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
