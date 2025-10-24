
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
      const startTime = performance.now();
      log("Buscando ferramentas da solução (otimizado)", { solution_id: module.solution_id });
      
      // Query otimizada com JOIN para buscar tudo de uma vez
      const { data: solutionTools, error: toolsError } = await supabase
        .from("solution_tools")
        .select(`
          *,
          tool_details:tools!inner(
            id,
            name,
            logo_url,
            has_member_benefit,
            benefit_type,
            official_url
          )
        `)
        .eq("solution_id", module.solution_id)
        .order("order_index");
      
      if (toolsError) {
        logError("Erro ao buscar ferramentas da solução", toolsError);
        throw toolsError;
      }
      
      const endTime = performance.now();
      log("Ferramentas recuperadas com sucesso", { 
        count: solutionTools?.length || 0,
        queryTime: `${(endTime - startTime).toFixed(0)}ms`,
        tools: solutionTools?.map(t => t.tool_name) 
      });
      
      return solutionTools?.map(tool => ({
        ...tool,
        details: Array.isArray(tool.tool_details) ? tool.tool_details[0] : tool.tool_details
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
    retry: 2,
    retryDelay: 1000,
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
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-aurora-primary/20 to-aurora-primary-dark/20 rounded-lg blur opacity-25"></div>
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-white via-aurora-primary-light to-aurora-primary bg-clip-text text-transparent">
            Ferramentas Necessárias
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Para implementar esta solução, você precisará das seguintes ferramentas:
          </p>
        </div>
      </div>
      
      {/* Enhanced Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <div key={tool.id} className="relative group">
            {/* Tool card glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-aurora-primary/10 to-aurora-primary-dark/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative">
              <ToolItem 
                toolName={tool.tool_name}
                toolUrl={tool.tool_url || ""}
                toolId={tool.details?.id}
                logoUrl={tool.details?.logo_url}
                isRequired={tool.is_required} 
                hasBenefit={tool.details?.has_member_benefit}
                benefitType={tool.details?.benefit_type as any}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
