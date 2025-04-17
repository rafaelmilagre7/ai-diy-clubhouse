
import React, { useEffect, useState } from "react";
import { Module, supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { ToolsLoading } from "./tools/ToolsLoading";
import { ToolsEmptyState } from "./tools/ToolsEmptyState";
import { ToolItem, Tool } from "./tools/ToolItem";

interface ModuleContentToolsProps {
  module: Module;
}

export const ModuleContentTools = ({ module }: ModuleContentToolsProps) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        log("Fetching tools", { solution_id: module.solution_id, module_id: module.id });
        
        const { data, error } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", module.solution_id);
        
        if (error) {
          throw error;
        }
        
        log("Tools fetched successfully", { count: data?.length || 0 });
        setTools(data || []);
      } catch (err) {
        logError("Error fetching tools", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [module.solution_id, module.id, log, logError]);

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Ferramentas Necessárias</h3>
        <ToolsLoading />
      </div>
    );
  }

  if (tools.length === 0) {
    log("No tools found for this solution", { solution_id: module.solution_id });
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Ferramentas Necessárias</h3>
      <p className="text-muted-foreground">
        Para implementar esta solução, você precisará das seguintes ferramentas:
      </p>
      
      <div className="space-y-3 mt-4">
        {tools.map((tool) => (
          <ToolItem key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};
