
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export interface Tool {
  id: string;
  tool_name: string;
  tool_url: string | null;
  is_required: boolean;
  solution_id: string;
  description?: string;
  icon?: string;
}

interface ToolItemProps {
  tool: Tool;
}

// Define a type for the icons to help TypeScript understand what we're doing
type IconComponent = (typeof Icons)[keyof typeof Icons];

export const ToolItem: React.FC<ToolItemProps> = ({ tool }) => {
  const { log } = useLogging();
  
  // Determine which icon to show with proper type handling
  let IconComponent: IconComponent = Icons.CheckCircle;
  
  if (tool.icon && tool.icon in Icons) {
    // Use type assertion to safely access the dynamic icon
    IconComponent = Icons[tool.icon as keyof typeof Icons] as IconComponent;
  } else if (!tool.is_required) {
    IconComponent = Icons.AlertTriangle;
  }

  // Get color based on required status
  const iconColorClass = tool.is_required ? "text-blue-600" : "text-yellow-600";
  
  return (
    <div className="flex items-start p-4 border rounded-md">
      <div className="bg-blue-100 p-2 rounded mr-4">
        <IconComponent className={cn("h-5 w-5", iconColorClass)} />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{tool.tool_name}</h4>
        <p className="text-sm text-muted-foreground mt-1">
          {tool.description || (tool.is_required 
            ? "Esta ferramenta é obrigatória para implementação." 
            : "Esta ferramenta é opcional para implementação.")}
        </p>
        
        {tool.tool_url && (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mt-2 p-0"
            onClick={() => {
              log("Tool URL clicked", { tool_id: tool.id, tool_name: tool.tool_name });
              window.open(tool.tool_url || "", "_blank");
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
