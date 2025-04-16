
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";

export interface UserStats {
  totalSolutions: number;
  completedSolutions: number;
  inProgressSolutions: number;
  completionRate: number;
  totalTimeSpent: number;
  avgTimePerSolution: number;
  lastActivity: string | null;
  categoryDistribution: {
    revenue: { total: number, completed: number },
    operational: { total: number, completed: number },
    strategy: { total: number, completed: number }
  };
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalSolutions: 0,
    completedSolutions: 0,
    inProgressSolutions: 0,
    completionRate: 0,
    totalTimeSpent: 0,
    avgTimePerSolution: 0,
    lastActivity: null,
    categoryDistribution: {
      revenue: { total: 0, completed: 0 },
      operational: { total: 0, completed: 0 },
      strategy: { total: 0, completed: 0 }
    }
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Buscar todas as soluções disponíveis
        const { data: solutions, error: solutionsError } = await supabase
          .from("solutions")
          .select("id, category, difficulty")
          .eq("published", true);

        if (solutionsError) {
          console.error("Erro ao buscar soluções:", solutionsError);
          return;
        }

        // Buscar progresso do usuário
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id);

        if (progressError) {
          console.error("Erro ao buscar progresso:", progressError);
          return;
        }

        // Dados de análise (opcional, dependendo da implementação)
        const { data: analyticsData, error: analyticsError } = await supabase
          .from("analytics")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (analyticsError) {
          console.warn("Erro ao buscar analytics:", analyticsError);
        }

        // Calcular estatísticas
        const totalSolutions = solutions?.length || 0;
        const userProgress = progressData || [];
        const completedSolutions = userProgress.filter(p => p.is_completed).length;
        const inProgressSolutions = userProgress.filter(p => !p.is_completed).length;
        const completionRate = totalSolutions > 0 
          ? Math.round((completedSolutions / totalSolutions) * 100) 
          : 0;

        // Calcular distribuição por categoria
        const categoryDistribution = {
          revenue: { 
            total: solutions?.filter(s => s.category === "revenue").length || 0, 
            completed: 0 
          },
          operational: { 
            total: solutions?.filter(s => s.category === "operational").length || 0, 
            completed: 0 
          },
          strategy: { 
            total: solutions?.filter(s => s.category === "strategy").length || 0, 
            completed: 0 
          }
        };

        // Se tivermos informações sobre as soluções completadas
        if (userProgress.length > 0 && solutions) {
          const solutionsMap = new Map(solutions.map(s => [s.id, s]));
          
          userProgress.forEach(progress => {
            if (progress.is_completed && solutionsMap.has(progress.solution_id)) {
              const solution = solutionsMap.get(progress.solution_id);
              if (solution?.category === "revenue") {
                categoryDistribution.revenue.completed++;
              } else if (solution?.category === "operational") {
                categoryDistribution.operational.completed++;
              } else if (solution?.category === "strategy") {
                categoryDistribution.strategy.completed++;
              }
            }
          });
        }

        // Calcular tempo gasto (fictício para esta implementação)
        const totalTimeSpent = completedSolutions * 45 + inProgressSolutions * 20; // minutos
        const avgTimePerSolution = completedSolutions > 0 
          ? Math.round(totalTimeSpent / completedSolutions) 
          : 0;

        // Última atividade
        const lastActivity = userProgress.length > 0 
          ? userProgress.sort((a, b) => 
              new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
            )[0].last_activity 
          : null;

        setStats({
          totalSolutions,
          completedSolutions,
          inProgressSolutions,
          completionRate,
          totalTimeSpent,
          avgTimePerSolution,
          lastActivity,
          categoryDistribution
        });
      } catch (error) {
        console.error("Erro ao calcular estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return { stats, loading };
};
