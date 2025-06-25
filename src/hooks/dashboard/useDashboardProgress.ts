
import { useState, useEffect } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

export interface UserProgress {
  solution_id: string;
  is_completed: boolean;
  current_module?: number;
  completed_modules?: number[];
  completion_percentage?: number;
  started_at?: string;
  completed_at?: string;
}

export interface Dashboard {
  user_id: string;
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
}

export const useDashboardProgress = () => {
  const { user } = useSimpleAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [error, setError] = useState<string | null>(null);

  console.log('[DASHBOARD-PROGRESS] Inicializando hook:', {
    hasUser: !!user,
    userId: user?.id?.substring(0, 8)
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log('[DASHBOARD-PROGRESS] Sem usuário, não carregando dados');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('[DASHBOARD-PROGRESS] Carregando soluções e progresso...');

        // Buscar todas as soluções publicadas
        const { data: solutionsData, error: solutionsError } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true as any);

        if (solutionsError) throw solutionsError;

        // Buscar progresso do usuário
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id as any);

        if (progressError) throw progressError;

        console.log('[DASHBOARD-PROGRESS] Dados carregados:', {
          solutionsCount: solutionsData?.length || 0,
          progressCount: progressData?.length || 0
        });

        setSolutions(solutionsData as any || []);
        setProgress(progressData as any || []);

      } catch (error: any) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setError(error.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Processar dados para o dashboard
  const getDashboardData = (): Dashboard => {
    if (!user) {
      return {
        user_id: '',
        active: [],
        completed: [],
        recommended: []
      };
    }

    const active: Solution[] = [];
    const completed: Solution[] = [];
    const recommended: Solution[] = [];

    solutions.forEach((solution: Solution) => {
      const userProgress = progress.find((p: any) => (p as any).solution_id === solution.id);
      
      if (userProgress) {
        if ((userProgress as any).is_completed) {
          completed.push(solution);
        } else {
          active.push(solution);
        }
      } else {
        recommended.push(solution);
      }
    });

    return {
      user_id: user.id,
      active: active.slice(0, 3), // Limitar a 3 soluções ativas
      completed: completed.slice(0, 5), // Limitar a 5 soluções completadas
      recommended: recommended.slice(0, 4) // Limitar a 4 recomendações
    };
  };

  return {
    loading,
    error,
    progress,
    solutions,
    getDashboardData
  };
};
