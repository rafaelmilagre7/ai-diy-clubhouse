
import React, { useEffect, useState } from "react";
import { Module, supabase } from "@/lib/supabase";
import { ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ModuleContentToolsProps {
  module: Module;
}

interface Tool {
  id: string;
  tool_name: string;
  tool_url: string | null;
  is_required: boolean;
  solution_id: string;
}

export const ModuleContentTools = ({ module }: ModuleContentToolsProps) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", module.solution_id);
        
        if (error) {
          console.error("Error fetching tools:", error);
          return;
        }
        
        setTools(data || []);
      } catch (err) {
        console.error("Error in tools fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [module.solution_id]);

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Ferramentas Necessárias</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start p-4 border rounded-md">
            <div className="bg-blue-100 p-2 rounded mr-4">
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
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
          <div key={tool.id} className="flex items-start p-4 border rounded-md">
            <div className="bg-blue-100 p-2 rounded mr-4">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{tool.tool_name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {tool.is_required 
                  ? "Esta ferramenta é obrigatória para implementação." 
                  : "Esta ferramenta é opcional para implementação."}
              </p>
              
              {tool.tool_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mt-2 p-0"
                  onClick={() => window.open(tool.tool_url || "", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Acessar ferramenta
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
