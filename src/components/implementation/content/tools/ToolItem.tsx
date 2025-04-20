
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";
import { Tool } from "@/types/toolTypes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ToolItemProps {
  toolId: string;
  isRequired: boolean;
}

export const ToolItem: React.FC<ToolItemProps> = ({ toolId, isRequired }) => {
  const { log } = useLogging();

  const { data: tool, isLoading } = useQuery({
    queryKey: ['tool', toolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (error) throw error;
      return data as Tool;
    }
  });

  if (isLoading || !tool) {
    return (
      <div className="flex items-start p-4 border rounded-md animate-pulse">
        <div className="space-y-3 w-full">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-start p-4 border rounded-md">
      <div className="bg-blue-100 p-2 rounded mr-4">
        <div className={`h-5 w-5 ${isRequired ? "text-blue-600" : "text-yellow-600"}`} />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{tool.name}</h4>
        <p className="text-sm text-muted-foreground mt-1">
          {tool.description}
        </p>
        
        {tool.official_url && (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mt-2 p-0"
            onClick={() => {
              log("Tool URL clicked", { tool_id: tool.id, tool_name: tool.name });
              window.open(tool.official_url, "_blank");
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Acessar ferramenta
          </Button>
        )}
      </div>
    </div>
  );
};

