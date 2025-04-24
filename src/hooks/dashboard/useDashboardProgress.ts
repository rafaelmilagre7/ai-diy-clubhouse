
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const [active, setActive] = useState<Solution[]>([]);
  const [completed, setCompleted] = useState<Solution[]>([]);
  const [recommended, setRecommended] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para processar os dados do progresso
  const processProgressData = useCallback(async () => {
    if (!user || !solutions || solutions.length === 0) {
      console.log("Condições não atendidas para processar dados de progresso");
      setActive([]);
      setCompleted([]);
      setRecommended([]);
      setLoading(false);
      return;
    }

    try {
      // Buscar progresso do usuário
      const { data: progressData, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao buscar progresso:", error);
        throw error;
      }

      console.log("Processando dados do dashboard:", {
        solutionsCount: solutions.length,
        progressDataCount: progressData?.length || 0,
        category: "general"
      });

      // Soluções ativas (em progresso)
      const activeSolutions = progressData
        ? solutions.filter(solution => 
            progressData.some(
              progress => 
                progress.solution_id === solution.id && 
                !progress.is_completed
            )
          )
        : [];

      // Soluções completas
      const completedSolutions = progressData
        ? solutions.filter(solution => 
            progressData.some(
              progress => 
                progress.solution_id === solution.id && 
                progress.is_completed
            )
          )
        : [];

      // Soluções recomendadas (não iniciadas)
      const recommendedSolutions = solutions.filter(solution => 
        !activeSolutions.some(active => active.id === solution.id) && 
        !completedSolutions.some(completed => completed.id === solution.id)
      );

      setActive(activeSolutions);
      setCompleted(completedSolutions);
      setRecommended(recommendedSolutions);

      console.log("Dashboard processado com sucesso:", {
        active: activeSolutions.length,
        completed: completedSolutions.length,
        recommended: recommendedSolutions.length,
        category: "general"
      });
    } catch (error) {
      console.error("Erro ao processar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [user, solutions]);

  // Efeito para processar dados quando as soluções ou o usuário mudarem
  useEffect(() => {
    processProgressData();
  }, [processProgressData]);

  return {
    active,
    completed,
    recommended,
    loading
  };
};
