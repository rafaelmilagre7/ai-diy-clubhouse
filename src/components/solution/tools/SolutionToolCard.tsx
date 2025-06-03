
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Wrench } from "lucide-react";

interface SolutionToolCardProps {
  tool: any;
}

export const SolutionToolCard = ({ tool }: SolutionToolCardProps) => {
  // Tratar tanto sistema novo (com referência) quanto antigo
  const toolData = tool.tools || tool;
  
  const handleOpenTool = () => {
    if (toolData.official_url || toolData.url) {
      window.open(toolData.official_url || toolData.url, '_blank');
    }
  };

  return (
    <Card className="border-white/10 bg-backgroundLight hover:bg-backgroundLight/80 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            {toolData.logo_url ? (
              <img 
                src={toolData.logo_url} 
                alt={toolData.name}
                className="w-10 h-10 rounded object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-viverblue/20 rounded flex items-center justify-center">
                <Wrench className="h-5 w-5 text-viverblue" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-textPrimary">
                {toolData.name}
              </h4>
              {toolData.description && (
                <p className="text-sm text-textSecondary mt-1 line-clamp-2">
                  {toolData.description}
                </p>
              )}
              {toolData.category && (
                <span className="inline-block text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-300 mt-2">
                  {toolData.category}
                </span>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenTool}
            className="w-full"
            disabled={!toolData.official_url && !toolData.url}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acessar Ferramenta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
