
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SolutionToolCard } from "../tools/SolutionToolCard";
import { SolutionToolsLoading } from "../tools/SolutionToolsLoading";
import { SolutionToolsEmpty } from "../tools/SolutionToolsEmpty";
import { useLogging } from "@/hooks/useLogging";

interface SolutionToolsTabProps {
  solutionId: string;
}

export const SolutionToolsTab = ({ solutionId }: SolutionToolsTabProps) => {
  const { log, logError } = useLogging();

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools', solutionId],
    queryFn: async () => {
      log("Buscando ferramentas da solução", { solutionId });
      
      try {
        // Primeiro tentar buscar pela nova tabela de referência
        const { data: toolsData, error: toolsError } = await supabase
          .from("solution_tools_reference")
          .select(`
            *,
            tools (*)
          `)
          .eq("solution_id", solutionId)
          .order('order_index');
        
        if (toolsError) {
          logError("Erro na tabela de referência, tentando fallback", toolsError);
          
          // Fallback para solution_tools (sistema antigo)
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("solution_tools")
            .select("*")
            .eq("solution_id", solutionId);
          
          if (fallbackError) {
            logError("Erro no fallback", fallbackError);
            throw fallbackError;
          }
          
          log("Usando dados do sistema antigo", { count: fallbackData?.length || 0 });
          return fallbackData || [];
        }
        
        log("Ferramentas encontradas via referência", { count: toolsData?.length || 0 });
        return toolsData || [];
      } catch (error) {
        logError("Erro ao processar ferramentas", error);
        throw error;
      }
    },
    enabled: !!solutionId,
    staleTime: 5 * 60 * 1000
  });

  if (error) {
    logError("Erro ao exibir ferramentas", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Erro ao carregar ferramentas desta solução.</p>
      </div>
    );
  }

  if (isLoading) {
    return <SolutionToolsLoading />;
  }

  if (!tools || tools.length === 0) {
    return <SolutionToolsEmpty />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-textPrimary">Ferramentas Necessárias</h3>
        <p className="text-textSecondary">
          Para implementar esta solução, você precisará das seguintes ferramentas:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <SolutionToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};
