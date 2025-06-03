
import { useState, useEffect } from "react";
import { supabase, Module } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export const useSolutionModules = (solutionId: string | undefined) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchModules = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        log("Buscando módulos para solução", { solutionId });

        const { data, error: fetchError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", solutionId)
          .order("module_order", { ascending: true });

        if (fetchError) {
          logError("Erro ao buscar módulos:", fetchError);
          throw fetchError;
        }

        setModules(data as Module[] || []);
        log("Módulos carregados:", { count: data?.length || 0 });
      } catch (error: any) {
        logError("Erro em useSolutionModules:", error);
        setError(error.message || "Erro ao buscar módulos");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [solutionId, log, logError]);

  return {
    modules,
    loading,
    error
  };
};
