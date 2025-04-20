
import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolImage } from "@/components/admin/solution/form/components/ToolImage";

interface ToolItemProps {
  toolName: string;
  toolUrl: string;
  isRequired: boolean;
}

export const ToolItem = ({ toolName, toolUrl, isRequired }: ToolItemProps) => {
  return (
    <div className="bg-card p-4 rounded-lg border flex flex-col h-full">
      <div className="flex items-center gap-3 mb-3">
        <ToolImage tool={{ name: toolName, logo_url: '' }} size="small" />
        <div>
          <h4 className="font-medium">{toolName}</h4>
          {isRequired ? (
            <Badge variant="secondary" className="mt-1">Obrigatória</Badge>
          ) : (
            <Badge variant="outline" className="mt-1">Opcional</Badge>
          )}
        </div>
      </div>
      
      <div className="mt-auto pt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => window.open(toolUrl, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Acessar ferramenta
        </Button>
      </div>
    </div>
  );
};
