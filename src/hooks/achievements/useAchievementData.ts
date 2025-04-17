
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProgressData, ChecklistData, BadgeData } from "@/types/achievementTypes";

export const useAchievementData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [checklistData, setChecklistData] = useState<ChecklistData[]>([]);
  const [badgesData, setBadgesData] = useState<BadgeData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const [progressResult, solutionsResult, checklistResult, badgesResult] = await Promise.all([
          supabase
            .from("progress")
            .select("*, solutions!inner(id, category)")
            .eq("user_id", user.id),

          supabase
            .from("solutions")
            .select("*")
            .eq("published", true),

          supabase
            .from("user_checklists")
            .select("*")
            .eq("user_id", user.id),

          supabase
            .from("user_badges")
            .select("*, badges(*)")
            .eq("user_id", user.id)
        ]);

        if (progressResult.error) throw progressResult.error;
        if (solutionsResult.error) throw solutionsResult.error;
        if (checklistResult.error) throw checklistResult.error;
        
        setProgressData(progressResult.data || []);
        setSolutions(solutionsResult.data || []);
        setChecklistData(checklistResult.data || []);
        setBadgesData(badgesResult.data || []);

      } catch (error: any) {
        console.error("Error in fetching achievements data:", error);
        setError("Ocorreu um erro ao carregar suas conquistas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  return {
    loading,
    error,
    progressData,
    solutions,
    checklistData,
    badgesData
  };
};
