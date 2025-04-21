
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProgressData, ChecklistData, BadgeData } from "@/types/achievementTypes";

export const useAchievementData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [checklistData, setChecklistData] = useState<ChecklistData[]>([]);
  const [badgesData, setBadgesData] = useState<BadgeData[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [
        progressResult, 
        solutionsResult, 
        checklistResult, 
        badgesResult,
        commentsResult,
        likesResult
      ] = await Promise.all([
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
          .eq("user_id", user.id),
          
        supabase
          .from("solution_comments")
          .select("*")
          .eq("user_id", user.id),
          
        supabase
          .from("solution_comments")
          .select("likes_count")
          .eq("user_id", user.id)
      ]);

      if (progressResult.error) throw progressResult.error;
      if (solutionsResult.error) throw solutionsResult.error;
      if (checklistResult.error) throw checklistResult.error;
      if (commentsResult.error) throw commentsResult.error;
      if (likesResult.error) throw likesResult.error;
      
      setProgressData(progressResult.data || []);
      setSolutions(solutionsResult.data || []);
      setChecklistData(checklistResult.data || []);
      setBadgesData(badgesResult.data || []);
      setComments(commentsResult.data || []);
      setTotalLikes(
        likesResult.data?.reduce((acc, comment) => acc + (comment.likes_count || 0), 0) || 0
      );

    } catch (error: any) {
      console.error("Error in fetching achievements data:", error);
      setError("Ocorreu um erro ao carregar suas conquistas");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    refetch,
    progressData,
    solutions,
    checklistData,
    badgesData,
    comments,
    totalLikes
  };
};
