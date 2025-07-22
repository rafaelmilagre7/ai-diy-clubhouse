
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ToolsTabProps {
  solutionId: string;
  onComplete: () => void;
}

interface SolutionTool {
  id: string;
  tool_name: string;
  tool_url?: string;
  is_required: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({ solutionId, onComplete }) => {
  const [viewedTools, setViewedTools] = useState<string[]>([]);

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools', solutionId],
    queryFn: async () => {
      console.log('Buscando ferramentas para solution_id:', solutionId);
      
      const { data, error } = await supabase
        .from('solution_tools')
        .select('*')
        .eq('solution_id', solutionId)
        .order('created_at');

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw error;
      }
      
      console.log('Ferramentas encontradas:', data);
      return data as SolutionTool[];
    }
  });

  const handleToolView = (toolId: string) => {
    if (!viewedTools.includes(toolId)) {
      setViewedTools(prev => [...prev, toolId]);
    }
  };

  useEffect(() => {
    if (tools && viewedTools.length === tools.length && tools.length > 0) {
      onComplete();
    }
  }, [viewedTools, tools, onComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('Erro na query:', error);
    return (
      <div className="text-center py-12">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar ferramentas</h3>
        <p className="text-muted-foreground mb-4">
          Ocorreu um erro ao buscar as ferramentas. Tente novamente.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <div className="text-center py-12">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma ferramenta encontrada</h3>
        <p className="text-muted-foreground mb-4">
          Esta solução não possui ferramentas específicas cadastradas.
        </p>
        <Button onClick={onComplete} variant="outline">
          Continuar para próxima etapa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Ferramentas da Solução</h2>
        <p className="text-muted-foreground">
          Explore as ferramentas necessárias para implementar esta solução
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => {
          const isViewed = viewedTools.includes(tool.id);
          
          return (
            <Card key={tool.id} className={cn(
              "p-6 transition-all duration-300 hover:shadow-lg border-2",
              isViewed ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
            )}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{tool.tool_name}</h3>
                    {tool.is_required && (
                      <Badge variant="destructive">Obrigatório</Badge>
                    )}
                  </div>
                  {isViewed && (
                    <Badge className="bg-primary/20 text-primary">
                      Visualizada
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground text-sm">
                  Ferramenta necessária para implementar esta solução
                </p>

                <div className="flex gap-2">
                  {tool.tool_url && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToolView(tool.id)}
                    >
                      <a 
                        href={tool.tool_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Acessar Ferramenta
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {tools.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Progresso: {viewedTools.length} de {tools.length} ferramentas visualizadas
          </p>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
              style={{ width: `${(viewedTools.length / tools.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsTab;
