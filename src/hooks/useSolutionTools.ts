
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface SolutionTool {
  id: string;
  tool_name: string;
  tool_url: string;
  is_required: boolean;
  description?: string;
}

export const useSolutionTools = (solutionId: string) => {
  const [tools, setTools] = useState<SolutionTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchTools = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        log("Buscando ferramentas da solução", { solutionId });

        const { data, error } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", solutionId as any)
          .order("created_at", { ascending: true });

        if (error) {
          logError("Erro ao buscar ferramentas da solução", error);
          throw error;
        }

        const formattedTools = (data || []).map((tool: any) => ({
          id: tool.id,
          tool_name: tool.tool_name,
          tool_url: tool.tool_url,
          is_required: tool.is_required,
          description: tool.description
        }));

        setTools(formattedTools);
        log("Ferramentas carregadas com sucesso", { count: formattedTools.length });
      } catch (err: any) {
        logError("Erro ao carregar ferramentas", err);
        setError(err.message);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [solutionId, log, logError]);

  return { tools, loading, error };
};
