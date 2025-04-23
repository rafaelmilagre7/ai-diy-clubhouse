
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SolutionToolsTabProps {
  solution: any;
}

interface Tool {
  id: string;
  tool_name: string;
  tool_url?: string;
  is_required?: boolean;
  logo_url?: string;
  description?: string;
  category?: string;
}

const SolutionToolsTab: React.FC<SolutionToolsTabProps> = ({ solution }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { log, logError } = useLogging("SolutionToolsTab");

  useEffect(() => {
    const fetchTools = async () => {
      if (!solution?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Buscar ferramentas vinculadas a esta solução
        const { data: solutionTools, error: solutionToolsError } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", solution.id);
          
        if (solutionToolsError) throw solutionToolsError;
        
        if (!solutionTools || solutionTools.length === 0) {
          setTools([]);
          return;
        }
        
        // Buscar informações detalhadas de cada ferramenta
        const toolPromises = solutionTools.map(async (solutionTool) => {
          const { data: toolData, error: toolError } = await supabase
            .from("tools")
            .select("*")
            .eq("name", solutionTool.tool_name)
            .single();
            
          if (toolError) {
            console.error("Erro ao buscar detalhes da ferramenta:", toolError);
            // Retornar dados básicos se não encontrar detalhes
            return {
              id: solutionTool.id,
              tool_name: solutionTool.tool_name,
              tool_url: solutionTool.tool_url,
              is_required: solutionTool.is_required
            };
          }
          
          return {
            id: solutionTool.id,
            tool_name: solutionTool.tool_name,
            tool_url: solutionTool.tool_url || toolData.official_url,
            is_required: solutionTool.is_required,
            logo_url: toolData.logo_url,
            description: toolData.description,
            category: toolData.category
          };
        });
        
        const toolsWithDetails = await Promise.all(toolPromises);
        setTools(toolsWithDetails);
      } catch (error) {
        logError("Erro ao carregar ferramentas", { error });
        toast({
          title: "Erro ao carregar ferramentas",
          description: "Não foi possível carregar as ferramentas desta solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTools();
  }, [solution?.id, toast, log, logError]);
  
  // Registrar clique na ferramenta para métricas
  const handleToolClick = async (tool: Tool) => {
    try {
      // Apenas registrar o clique
      log("Ferramenta clicada", { 
        tool_name: tool.tool_name,
        solution_id: solution.id
      });
    } catch (error) {
      // Silenciosamente falhar - não bloquear a navegação
      logError("Erro ao registrar clique na ferramenta", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhuma ferramenta cadastrada para esta solução.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Card key={tool.id} className={cn(
            "overflow-hidden hover:border-primary/50 transition-colors",
            tool.is_required && "border-primary/30"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-background rounded-full p-2 flex-shrink-0">
                  {tool.logo_url ? (
                    <img 
                      src={tool.logo_url} 
                      alt={tool.tool_name} 
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground">
                        {tool.tool_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center">
                    <h3 className="font-medium">{tool.tool_name}</h3>
                    {tool.is_required && (
                      <Badge className="ml-2 bg-primary" variant="default">
                        Obrigatória
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {tool.description || "Ferramenta necessária para implementação"}
                  </p>
                  {tool.category && (
                    <Badge variant="outline" className="mt-2">
                      {tool.category}
                    </Badge>
                  )}

                  {tool.tool_url && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleToolClick(tool);
                          window.open(tool.tool_url, "_blank");
                        }}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Acessar Ferramenta
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SolutionToolsTab;
