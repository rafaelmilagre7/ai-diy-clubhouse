
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

interface ProgressData {
  totalSolutions: number;
  completedSolutions: number;
  completionRate: number;
  averageTime: string;
  streak: number;
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    timestamp: Date;
    status: "completed" | "current" | "upcoming";
  }>;
  isLoading: boolean;
  error: string | null;
}

export const useProgressData = () => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState({
    totalSolutions: 0,
    completedSolutions: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Buscar progresso do usuário
        const { data: progress, error: progressError } = await supabase
          .from("progress")
          .select(`
            *,
            solutions (
              id,
              title,
              difficulty,
              estimated_time_hours
            )
          `)
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        // Buscar total de soluções disponíveis
        const { count: totalSolutions } = await supabase
          .from("solutions")
          .select("*", { count: "exact", head: true })
          .eq("published", true);

        const completedSolutions = progress?.filter(p => p.is_completed).length || 0;
        const completionRate = totalSolutions ? Math.round((completedSolutions / totalSolutions) * 100) : 0;

        // Calcular tempo médio (mockado por enquanto)
        const averageTime = "2.5h";
        
        // Calcular sequência (mockado por enquanto)
        const streak = 7;

        // Atividade recente
        const recentActivity = progress?.slice(0, 5).map(p => ({
          id: p.id,
          title: p.solutions?.title || "Solução",
          type: "implementation",
          timestamp: new Date(p.updated_at),
          status: p.is_completed ? "completed" as const : "current" as const
        })) || [];

        setProgressData({
          totalSolutions: totalSolutions || 0,
          completedSolutions,
          recentActivity
        });

        log("Progress data loaded successfully", {
          totalSolutions,
          completedSolutions,
          completionRate
        });

      } catch (error: any) {
        logError("Error fetching progress data", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [user, log, logError]);

  const calculatedData = useMemo(() => {
    const completionRate = progressData.totalSolutions ? 
      Math.round((progressData.completedSolutions / progressData.totalSolutions) * 100) : 0;
    
    return {
      ...progressData,
      completionRate,
      averageTime: "2.5h", // Mockado
      streak: 7, // Mockado
      isLoading,
      error
    };
  }, [progressData, isLoading, error]);

  return calculatedData;
};
