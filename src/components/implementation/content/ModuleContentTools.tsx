
import React, { useEffect } from "react";
import { Module, supabase } from "@/lib/supabase";
import { ToolsLoading } from "./tools/ToolsLoading";
import { ToolsEmptyState } from "./tools/ToolsEmptyState";
import { ToolItem } from "./tools/ToolItem";
import { useQuery } from "@tanstack/react-query";
import { SolutionTool } from "@/types/toolTypes";
import { useToolsData } from "@/hooks/useToolsData";

interface ModuleContentToolsProps {
  module: Module;
}

export const ModuleContentTools = ({ module }: ModuleContentToolsProps) => {
  // Garantir que os dados das ferramentas estejam corretos
  const { isLoading: toolsDataLoading } = useToolsData();

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools', module.solution_id],
    queryFn: async () => {
      console.log("Buscando ferramentas da solução", { solution_id: module.solution_id });
      
      const { data, error } = await supabase
        .from("solution_tools")
        .select("*")
        .eq("solution_id", module.solution_id);
      
      if (error) {
        console.error("Erro ao buscar ferramentas da solução", error);
        throw error;
      }
      
      console.log("Ferramentas da solução recuperadas", { 
        count: data?.length || 0, 
        tools: data?.map(t => t.tool_name) 
      });
      
      return data as SolutionTool[];
    },
    enabled: !toolsDataLoading // Só executa a query depois que os dados estiverem prontos
  });

  // Log adicional após a consulta ser concluída
  useEffect(() => {
    if (tools && tools.length > 0) {
      console.log("Ferramentas disponíveis para renderização", {
        solution_id: module.solution_id,
        tools: tools.map(t => ({
          name: t.tool_name,
          url: t.tool_url,
          required: t.is_required
        }))
      });
    }
  }, [tools, module.solution_id]);

  if (error) {
    console.error("Erro ao exibir ferramentas", error);
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
    console.log("Nenhuma ferramenta encontrada para esta solução", { solution_id: module.solution_id });
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Ferramentas Necessárias</h3>
      <p className="text-muted-foreground">
        Para implementar esta solução, você precisará das seguintes ferramentas:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {tools.map((tool) => (
          <ToolItem 
            key={tool.id} 
            toolName={tool.tool_name}
            toolUrl={tool.tool_url}
            isRequired={tool.is_required} 
          />
        ))}
      </div>
    </div>
  );
};
