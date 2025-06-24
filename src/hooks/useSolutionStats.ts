
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface SolutionStats {
  resourcesCount: number;
  toolsCount: number;
  videosCount: number;
}

export const useSolutionStats = (solutionId: string) => {
  const [stats, setStats] = useState<SolutionStats>({
    resourcesCount: 0,
    toolsCount: 0,
    videosCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchStats = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        log("Buscando estatísticas da solução", { solutionId });

        // Buscar contagem de recursos
        const { count: resourcesCount } = await supabase
          .from("solution_resources")
          .select("*", { count: 'exact', head: true })
          .eq("solution_id", solutionId as any);

        // Buscar contagem de ferramentas
        const { count: toolsCount } = await supabase
          .from("solution_tools")
          .select("*", { count: 'exact', head: true })
          .eq("solution_id", solutionId as any);

        // Buscar contagem de vídeos (recursos do tipo video)
        const { count: videosCount } = await supabase
          .from("solution_resources")
          .select("*", { count: 'exact', head: true })
          .eq("solution_id", solutionId as any)
          .eq("type", "video" as any);

        setStats({
          resourcesCount: resourcesCount || 0,
          toolsCount: toolsCount || 0,
          videosCount: videosCount || 0
        });

        log("Estatísticas carregadas com sucesso", { 
          resourcesCount, 
          toolsCount, 
          videosCount
        });
      } catch (err: any) {
        logError("Erro ao carregar estatísticas", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [solutionId, log, logError]);

  return { stats, loading, error };
};
