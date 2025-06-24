
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface SolutionResource {
  id: string;
  name: string;
  url: string;
  type: string;
  format?: string;
  description?: string;
}

export const useSolutionResources = (solutionId: string) => {
  const [resources, setResources] = useState<SolutionResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchResources = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        log("Buscando recursos da solução", { solutionId });

        const { data, error } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solutionId as any)
          .order("created_at", { ascending: true });

        if (error) {
          logError("Erro ao buscar recursos da solução", error);
          throw error;
        }

        const formattedResources = (data || []).map((resource: any) => ({
          id: resource.id,
          name: resource.name,
          url: resource.url,
          type: resource.type,
          format: resource.format,
          description: resource.description
        }));

        setResources(formattedResources);
        log("Recursos carregados com sucesso", { count: formattedResources.length });
      } catch (err: any) {
        logError("Erro ao carregar recursos", err);
        setError(err.message);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [solutionId, log, logError]);

  return { resources, loading, error };
};
