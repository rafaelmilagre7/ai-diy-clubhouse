
import React, { useEffect, useState } from "react";
import { Module, supabase } from "@/lib/supabase";
import { ToolsLoading } from "./tools/ToolsLoading";
import { ToolsEmptyState } from "./tools/ToolsEmptyState";
import { ToolItem } from "./tools/ToolItem";
import { useQuery } from "@tanstack/react-query";
import { SolutionTool } from "@/types/toolTypes";
import { useToolsData } from "@/hooks/useToolsData";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentToolsProps {
  module: Module;
}

export const ModuleContentTools = ({ module }: ModuleContentToolsProps) => {
  const { log, logError } = useLogging();
  // Garantir que os dados das ferramentas estejam corretos
  const { isLoading: toolsDataLoading } = useToolsData();

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools', module.solution_id],
    queryFn: async () => {
      log("Buscando ferramentas da solução", { solution_id: module.solution_id });
      
      // Buscar as ferramentas associadas à solução
      const { data: solutionTools, error: toolsError } = await supabase
        .from("solution_tools")
        .select("*")
        .eq("solution_id", module.solution_id);
      
      if (toolsError) {
        logError("Erro ao buscar ferramentas da solução", toolsError);
        throw toolsError;
      }
      
      // Para cada ferramenta da solução, buscar informações detalhadas
      const toolsWithDetails = await Promise.all(
        (solutionTools || []).map(async (solutionTool) => {
          try {
            // Buscar informações detalhadas da ferramenta pelo nome
            const { data: toolDetails, error: detailsError } = await supabase
              .from("tools")
              .select("*")
              .ilike("name", solutionTool.tool_name)
              .maybeSingle();
            
            if (detailsError) {
              logError("Erro ao buscar detalhes da ferramenta", {
                error: detailsError,
                tool_name: solutionTool.tool_name
              });
            }
            
            return {
              ...solutionTool,
              details: toolDetails || null
            };
          } catch (error) {
            logError("Erro ao processar detalhes da ferramenta", {
              error,
              tool_name: solutionTool.tool_name
            });
            return solutionTool;
          }
        })
      );
      
      log("Ferramentas da solução recuperadas", { 
        count: toolsWithDetails?.length || 0, 
        tools: toolsWithDetails?.map(t => t.tool_name) 
      });
      
      return toolsWithDetails;
    },
    enabled: !toolsDataLoading // Só executa a query depois que os dados estiverem prontos
  });

  if (error) {
    logError("Erro ao exibir ferramentas", error);
    return null;
  }

  if (isLoading || toolsDataLoading) {
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
        <h3 className="text-lg font-semibold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
          Ferramentas Necessárias
        </h3>
        <p className="text-muted-foreground mt-1">
          Para implementar esta solução, você precisará das seguintes ferramentas:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <ToolItem 
            key={tool.id} 
            toolName={tool.tool_name}
            toolUrl={tool.tool_url || ""}
            toolId={tool.details?.id}
            isRequired={tool.is_required} 
            hasBenefit={tool.details?.has_member_benefit}
            benefitType={tool.details?.benefit_type as any}
          />
        ))}
      </div>
    </div>
  );
};
