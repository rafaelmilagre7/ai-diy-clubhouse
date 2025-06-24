
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";

export interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  published: boolean;
  thumbnail_url?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  user_id: string;
  solution_id: string;
  is_completed: boolean;
  current_module?: number;
  completed_modules?: number[];
  started_at?: string;
  completed_at?: string;
}

export const useSolutionData = (solutionId?: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        log("Fetching solution data", { solutionId });

        // Fetch solution
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", solutionId)
          .single();

        if (solutionError) throw solutionError;

        setSolution(solutionData);

        // Fetch progress if user is logged in
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", solutionId)
            .single();

          if (progressError && progressError.code !== 'PGRST116') {
            logError("Progress fetch error", progressError);
          } else {
            setProgress(progressData || null);
          }
        }

        log("Solution data loaded successfully");
      } catch (err: any) {
        logError("Error loading solution data", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [solutionId, user, log, logError]);

  return { solution, setSolution, progress, loading, error };
};
