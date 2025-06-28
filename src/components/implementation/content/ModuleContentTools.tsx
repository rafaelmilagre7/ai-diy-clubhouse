
import React, { useEffect, useState } from "react";
import { Module, supabase } from "@/lib/supabase";
import { ToolsLoading } from "./tools/ToolsLoading";
import { ToolsEmptyState } from "./tools/ToolsEmptyState";
import { ToolItem } from "./tools/ToolItem";
import { useQuery } from "@tanstack/react-query";
import { useToolsData } from "@/hooks/useToolsData";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentToolsProps {
  module: Module;
}

export const ModuleContentTools = ({ module }: ModuleContentToolsProps) => {
  const { log, logError } = useLogging();
  const { isLoading: toolsDataLoading } = useToolsData();

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['module-tools', module.solution_id],
    queryFn: async () => {
      log("Buscando ferramentas do módulo", { solution_id: module.solution_id });
      
      // Buscar as ferramentas diretamente da tabela tools
      const { data: allTools, error: toolsError } = await supabase
        .from("tools")
        .select("*")
        .eq("is_active", true);
      
      if (toolsError) {
        logError("Erro ao buscar ferramentas", toolsError);
        throw toolsError;
      }
      
      // Para demonstração, retornar algumas ferramentas
      const mockSolutionTools = (allTools || []).slice(0, 3).map(tool => ({
        id: tool.id,
        tool_name: tool.name,
        tool_url: tool.url,
        is_required: true,
        details: tool
      }));
      
      log("Ferramentas recuperadas", { 
        count: mockSolutionTools?.length || 0, 
        tools: mockSolutionTools?.map((t: any) => t.tool_name) 
      });
      
      return mockSolutionTools;
    },
    enabled: !toolsDataLoading
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
        <h3 className="text-lg font-semibold">Ferramentas Necessárias</h3>
        <p className="text-muted-foreground mt-1">
          Para implementar esta solução, você precisará das seguintes ferramentas:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool: any) => (
          <ToolItem 
            key={tool.id} 
            toolName={tool.tool_name}
            toolUrl={tool.tool_url || ""}
            toolId={tool.details?.id}
            isRequired={tool.is_required} 
            hasBenefit={tool.details?.has_member_benefit}
            benefitType={tool.details?.benefit_type}
          />
        ))}
      </div>
    </div>
  );
};
