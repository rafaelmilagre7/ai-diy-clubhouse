
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { ToolItem } from "@/components/implementation/content/tools/ToolItem";
import { cn } from "@/lib/utils";

interface ToolsTabProps {
  solutionId: string;
  onComplete: () => void;
}

interface ToolWithDetails {
  id: string;
  tool_name: string;
  tool_url?: string;
  is_required: boolean;
  tool_id?: string;
  tool_logo_url?: string;
  tool_has_member_benefit?: boolean;
  tool_benefit_type?: string;
}

const ToolsTab: React.FC<ToolsTabProps> = ({ solutionId, onComplete }) => {
  const [viewedTools, setViewedTools] = useState<string[]>([]);

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools', solutionId],
    queryFn: async () => {
      console.log('Buscando ferramentas para solution_id:', solutionId);
      
      // Buscar ferramentas da solução com JOIN para obter detalhes das ferramentas
      const { data, error } = await supabase
        .from('solution_tools')
        .select(`
          id,
          tool_name,
          tool_url,
          is_required,
          created_at
        `)
        .eq('solution_id', solutionId)
        .order('created_at');

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw error;
      }

      // Para cada ferramenta, tentar buscar detalhes adicionais da tabela tools
      const toolsWithDetails = await Promise.all(
        data.map(async (solutionTool) => {
          const { data: toolDetails } = await supabase
            .from('tools')
            .select('id, logo_url, has_member_benefit, benefit_type')
            .ilike('name', solutionTool.tool_name)
            .limit(1)
            .single();

          return {
            ...solutionTool,
            tool_id: toolDetails?.id,
            tool_logo_url: toolDetails?.logo_url,
            tool_has_member_benefit: toolDetails?.has_member_benefit,
            tool_benefit_type: toolDetails?.benefit_type,
          };
        })
      );
      
      console.log('Ferramentas com detalhes encontradas:', toolsWithDetails);
      return toolsWithDetails as ToolWithDetails[];
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const isViewed = viewedTools.includes(tool.id);
          
          return (
            <div 
              key={tool.id} 
              className={cn(
                "relative transition-all duration-300",
                isViewed && "ring-2 ring-primary/50"
              )}
              onClick={() => handleToolView(tool.id)}
            >
              <ToolItem
                toolName={tool.tool_name}
                toolUrl={tool.tool_url}
                toolId={tool.tool_id}
                isRequired={tool.is_required}
                hasBenefit={tool.tool_has_member_benefit}
                benefitType={tool.tool_benefit_type as "discount" | "free" | "special"}
              />
              {isViewed && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Visualizada
                </div>
              )}
            </div>
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
