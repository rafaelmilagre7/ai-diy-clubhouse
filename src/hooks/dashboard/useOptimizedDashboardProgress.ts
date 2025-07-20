
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

export const useOptimizedDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [error, setError] = useState<any | null>(null);

  console.log('🔍 [PROGRESS] Estado:', {
    hasUser: !!user,
    solutionsCount: solutions.length,
    loading,
    progressCount: progressData.length
  });

  // Buscar dados de progresso
  useEffect(() => {
    if (!user?.id || solutions.length === 0) {
      console.log('⏳ [PROGRESS] Aguardando user e solutions...');
      setProgressData([]);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 [PROGRESS] Buscando progresso...');

        const { data, error: progressError } = await supabase
          .from("progress")
          .select("solution_id, is_completed, completed_at, last_activity, created_at")
          .eq("user_id", user.id);
          
        if (progressError) {
          throw progressError;
        }

        console.log('✅ [PROGRESS] Progresso carregado:', data?.length || 0);
        setProgressData(data || []);
        
      } catch (error) {
        console.error("❌ [PROGRESS] Erro:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.id, solutions.length]);

  // Processamento dos dados (síncrono)
  const processedData = useMemo(() => {
    if (solutions.length === 0) {
      console.log('📊 [PROGRESS] Sem solutions - retornando vazio');
      return { 
        active: [], 
        completed: [], 
        recommended: [],
        isEmpty: true
      };
    }

    if (progressData.length === 0) {
      console.log('📊 [PROGRESS] Sem progresso - todas recomendadas');
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }

    try {
      // Criar mapa de progresso
      const progressMap = new Map();
      progressData.forEach(progress => {
        progressMap.set(progress.solution_id, progress);
      });

      const active: Solution[] = [];
      const completed: Solution[] = [];
      const recommended: Solution[] = [];

      solutions.forEach(solution => {
        const progress = progressMap.get(solution.id);
        
        if (!progress) {
          recommended.push(solution);
        } else if (progress.is_completed) {
          completed.push(solution);
        } else {
          active.push(solution);
        }
      });

      console.log('📊 [PROGRESS] Processamento concluído:', {
        active: active.length,
        completed: completed.length,
        recommended: recommended.length
      });

      return {
        active,
        completed,
        recommended,
        isEmpty: false
      };
    } catch (err) {
      console.error("❌ [PROGRESS] Erro no processamento:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }
  }, [solutions, progressData]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading,
    error,
    isEmpty: processedData.isEmpty
  };
};
