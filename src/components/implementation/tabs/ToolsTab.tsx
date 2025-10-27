
import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wrench, CheckCircle } from "lucide-react";
import { ToolItem } from "@/components/implementation/content/tools/ToolItem";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [isAware, setIsAware] = useState(false);
  const completedRef = useRef(false);

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools', solutionId],
    queryFn: async () => {
      // Buscar ferramentas da solução com JOIN direto usando tool_id
      const { data, error } = await supabase
        .from('solution_tools')
        .select(`
          id,
          tool_name,
          tool_url,
          is_required,
          tool_id,
          created_at,
          tools!inner (
            id,
            logo_url,
            has_member_benefit,
            benefit_type
          )
        `)
        .eq('solution_id', solutionId)
        .order('created_at');

      if (error) throw error;

      // Transformar dados para o formato esperado
      return data.map((item: any) => {
        const toolDetails = Array.isArray(item.tools) ? item.tools[0] : item.tools;
        return {
          id: item.id,
          tool_name: item.tool_name,
          tool_url: item.tool_url,
          is_required: item.is_required,
          tool_id: item.tool_id,
          tool_logo_url: toolDetails?.logo_url,
          tool_has_member_benefit: toolDetails?.has_member_benefit,
          tool_benefit_type: toolDetails?.benefit_type,
        };
      }) as ToolWithDetails[];
    }
  });

  const handleToolView = (toolId: string) => {
    if (!viewedTools.includes(toolId)) {
      setViewedTools(prev => [...prev, toolId]);
    }
  };

  const handleMarkAsAware = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      setIsAware(true);
      toast.success("Ótimo! Você está ciente das ferramentas necessárias.");
      onComplete();
    }
  };

  useEffect(() => {
    if (tools && viewedTools.length === tools.length && tools.length > 0 && !completedRef.current) {
      completedRef.current = true;
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
                logoUrl={tool.tool_logo_url}
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

      {/* Botão para marcar como ciente das ferramentas */}
      <div className="text-center mt-8 p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent backdrop-blur-sm rounded-2xl border-0">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Pronto para continuar?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Após revisar as ferramentas acima, confirme que você está ciente dos recursos necessários para implementar esta solução.
          </p>
          <Button 
            onClick={handleMarkAsAware}
            disabled={isAware}
            className="bg-primary/90 hover:bg-primary px-8"
          >
            {isAware ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluído
              </>
            ) : (
              "Estou ciente das ferramentas"
            )}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default ToolsTab;
