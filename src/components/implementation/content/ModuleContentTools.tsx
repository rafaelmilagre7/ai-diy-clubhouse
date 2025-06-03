
import React from "react";
import { Module, supabase } from "@/lib/supabase";
import { ToolsLoading } from "./tools/ToolsLoading";
import { ToolItem } from "./tools/ToolItem";
import { useQuery } from "@tanstack/react-query";
import { Tool } from "@/types/toolTypes";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentToolsProps {
  module: Module;
}

interface SolutionToolReference {
  id: string;
  solution_id: string;
  tool_id: string;
  is_required: boolean;
  order_index: number;
  tools: Tool;
}

export const ModuleContentTools = ({ module }: ModuleContentToolsProps) => {
  const { log, logError } = useLogging();

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools-reference', module.solution_id],
    queryFn: async () => {
      log("Buscando ferramentas da solução via tabela de referência", { solution_id: module.solution_id });
      
      try {
        // Buscar ferramentas usando a nova tabela de referência
        const { data: toolsData, error: toolsError } = await supabase
          .from("solution_tools_reference")
          .select(`
            *,
            tools (*)
          `)
          .eq("solution_id", module.solution_id)
          .order('order_index');
        
        if (toolsError) {
          logError("Erro ao buscar ferramentas via tabela de referência", toolsError);
          
          // Fallback para a tabela antiga se a nova não funcionar
          log("Tentando fallback para solution_tools...");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("solution_tools")
            .select("*")
            .eq("solution_id", module.solution_id);
          
          if (fallbackError) {
            logError("Erro no fallback para solution_tools", fallbackError);
            throw fallbackError;
          }
          
          // Buscar detalhes das ferramentas para o fallback
          const toolsWithDetails = await Promise.all(
            (fallbackData || []).map(async (solutionTool) => {
              const { data: toolDetails } = await supabase
                .from("tools")
                .select("*")
                .ilike("name", solutionTool.tool_name)
                .maybeSingle();
              
              return {
                ...solutionTool,
                tools: toolDetails || {
                  id: solutionTool.tool_name,
                  name: solutionTool.tool_name,
                  official_url: solutionTool.tool_url || "",
                  has_member_benefit: false
                }
              };
            })
          );
          
          return toolsWithDetails;
        }
        
        log("Ferramentas da solução recuperadas via tabela de referência", { 
          count: toolsData?.length || 0
        });
        
        return toolsData || [];
      } catch (error) {
        logError("Erro ao processar ferramentas da solução", error);
        throw error;
      }
    },
    enabled: !!module.solution_id,
    staleTime: 5 * 60 * 1000
  });

  if (error) {
    logError("Erro ao exibir ferramentas", error);
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Ferramentas Necessárias</h3>
        <ToolsLoading />
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    log("Nenhuma ferramenta encontrada para esta solução", { solution_id: module.solution_id });
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      <div>
        <h3 className="text-lg font-semibold">Ferramentas Necessárias</h3>
        <p className="text-muted-foreground mt-1">
          Para implementar esta solução, você precisará das seguintes ferramentas:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((toolRef) => {
          const tool = toolRef.tools;
          return (
            <ToolItem 
              key={toolRef.id} 
              toolName={tool.name}
              toolId={tool.id}
              toolUrl={tool.official_url || ""}
              isRequired={toolRef.is_required} 
              hasBenefit={tool.has_member_benefit}
              benefitType={tool.benefit_type as any}
            />
          );
        })}
      </div>
    </div>
  );
};
