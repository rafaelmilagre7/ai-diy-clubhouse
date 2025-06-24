
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Wrench, Star } from "lucide-react";
import { SolutionTool } from "@/hooks/useSolutionTools";
import { useToolImage } from "@/hooks/useToolImage";

interface ToolItemProps {
  tool: SolutionTool;
}

export const ToolItem = ({ tool }: ToolItemProps) => {
  const { logoUrl, loading } = useToolImage({ toolName: tool.tool_name });

  const formatToolName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getToolInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleOpenTool = () => {
    window.open(tool.tool_url, "_blank");
  };

  const renderToolIcon = () => {
    if (logoUrl && !loading) {
      return (
        <div className="bg-white h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            src={logoUrl} 
            alt={`Logo ${tool.tool_name}`}
            className="h-full w-full object-contain"
            onError={(e) => {
              // Fallback para ícone genérico em caso de erro
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
              if (fallback) {
                fallback.classList.remove('hidden');
              }
            }}
          />
          <div className="fallback-icon hidden bg-viverblue/20 text-viverblue h-10 w-10 rounded-lg flex items-center justify-center font-semibold">
            {getToolInitial(tool.tool_name)}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-viverblue/20 text-viverblue h-10 w-10 rounded-lg flex items-center justify-center font-semibold">
        {loading ? <Wrench className="h-5 w-5" /> : getToolInitial(tool.tool_name)}
      </div>
    );
  };

  return (
    <Card className="bg-[#151823] border border-white/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          {renderToolIcon()}
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-neutral-100 flex items-center gap-2">
                {formatToolName(tool.tool_name)}
                {tool.is_required && <Star className="h-4 w-4 text-amber-400" />}
              </h4>
            </div>
            
            <div className="flex gap-2 mb-3">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  tool.is_required 
                    ? "bg-amber-900/30 text-amber-400 border-amber-900/30"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700"
                }`}
              >
                {tool.is_required ? "Obrigatória" : "Opcional"}
              </Badge>
            </div>
            
            {tool.description && (
              <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
                {tool.description}
              </p>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenTool}
          className="w-full bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Acessar Ferramenta
        </Button>
      </CardContent>
    </Card>
  );
};
