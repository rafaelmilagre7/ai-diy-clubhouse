
import React from "react";
import { Module, supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { ToolsLoading } from "./tools/ToolsLoading";
import { ToolsEmptyState } from "./tools/ToolsEmptyState";
import { ToolItem } from "./tools/ToolItem";
import { useQuery } from "@tanstack/react-query";
import { SolutionTool } from "@/types/toolTypes";

interface ModuleContentToolsProps {
  module: Module;
}

export const ModuleContentTools = ({ module }: ModuleContentToolsProps) => {
  const { log, logError } = useLogging();

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools', module.solution_id],
    queryFn: async () => {
      log("Fetching tools", { solution_id: module.solution_id });
      
      const { data, error } = await supabase
        .from("solution_tools")
        .select("*")
        .eq("solution_id", module.solution_id);
      
      if (error) {
        logError("Error fetching tools", error);
        throw error;
      }
      
      log("Tools fetched successfully", { count: data?.length || 0 });
      return data as SolutionTool[];
    }
  });

  if (error) {
    logError("Error displaying tools", error);
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
    log("No tools found for this solution", { solution_id: module.solution_id });
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
            toolId={tool.tool_id} 
            isRequired={tool.is_required} 
          />
        ))}
      </div>
    </div>
  );
};
