
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabBasedToolsSectionProps {
  solutionId: string;
  tools: any[];
}

export const TabBasedToolsSection = ({ solutionId, tools }: TabBasedToolsSectionProps) => {
  if (tools.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Ferramentas Necessárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma ferramenta específica</h3>
              <p className="text-muted-foreground">
                Esta solução não requer ferramentas externas específicas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Ferramentas Necessárias
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Estas são as ferramentas recomendadas para implementar esta solução
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {tools.map((tool, index) => (
          <Card key={tool.id || index} className="border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2">
                    {tool.tools?.name || tool.name || "Ferramenta"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {tool.tools?.description || tool.description || "Ferramenta necessária para esta implementação."}
                  </p>
                  
                  {tool.tools?.category && (
                    <span className="inline-block px-2 py-1 bg-viverblue/10 text-viverblue text-xs rounded">
                      {tool.tools.category}
                    </span>
                  )}
                </div>
                
                {(tool.tools?.official_url || tool.url) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(tool.tools?.official_url || tool.url, '_blank')}
                    className="ml-4"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
