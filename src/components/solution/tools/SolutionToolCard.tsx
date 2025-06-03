
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SolutionToolCardProps {
  tool: any;
}

export const SolutionToolCard = ({ tool }: SolutionToolCardProps) => {
  const navigate = useNavigate();
  
  // Para compatibilidade com ambos os sistemas (novo e antigo)
  const toolData = tool.tools || tool;
  const isRequired = tool.is_required ?? false;
  const hasBenefit = toolData.has_member_benefit ?? false;

  const handleViewTool = () => {
    if (toolData.id) {
      navigate(`/tools/${toolData.id}`);
    }
  };

  const handleVisitOfficial = () => {
    if (toolData.official_url || toolData.tool_url) {
      window.open(toolData.official_url || toolData.tool_url, '_blank');
    }
  };

  return (
    <Card className="border-white/10 bg-backgroundLight hover:bg-backgroundLight/80 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            {toolData.logo_url && (
              <img 
                src={toolData.logo_url} 
                alt={`Logo ${toolData.name}`}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-textPrimary truncate">
                {toolData.name || toolData.tool_name}
              </h4>
              <p className="text-sm text-textSecondary mt-1 line-clamp-2">
                {toolData.description || "Ferramenta necessária para implementação"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isRequired && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-red-900/40 text-red-200 rounded border border-red-700/30">
                <Shield className="h-3 w-3 mr-1" />
                Obrigatória
              </span>
            )}
            {hasBenefit && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-900/40 text-yellow-200 rounded border border-yellow-700/30">
                <Star className="h-3 w-3 mr-1" />
                Benefício
              </span>
            )}
            {toolData.category && (
              <span className="px-2 py-1 text-xs bg-blue-900/40 text-blue-200 rounded border border-blue-700/30">
                {toolData.category}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {toolData.id && (
              <Button
                onClick={handleViewTool}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Ver detalhes
              </Button>
            )}
            <Button
              onClick={handleVisitOfficial}
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
