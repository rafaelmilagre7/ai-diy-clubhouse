
import React from "react";
import { Module } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ExternalLink, CheckCircle, AlertCircle, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLogging } from "@/hooks/useLogging";

interface EnhancedModuleContentToolsProps {
  module: Module;
}

export const EnhancedModuleContentTools = ({ module }: EnhancedModuleContentToolsProps) => {
  const { log, logError } = useLogging();

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools-enhanced', module.solution_id],
    queryFn: async () => {
      log("Buscando ferramentas da solução", { solution_id: module.solution_id });
      
      const { data: solutionTools, error: toolsError } = await supabase
        .from("solution_tools")
        .select("*")
        .eq("solution_id", module.solution_id);
      
      if (toolsError) {
        logError("Erro ao buscar ferramentas da solução", toolsError);
        throw toolsError;
      }
      
      const toolsWithDetails = await Promise.all(
        (solutionTools || []).map(async (solutionTool) => {
          try {
            const { data: toolDetails, error: detailsError } = await supabase
              .from("tools")
              .select("*")
              .ilike("name", solutionTool.tool_name)
              .maybeSingle();
            
            if (detailsError) {
              logError("Erro ao buscar detalhes da ferramenta", {
                error: detailsError,
                tool_name: solutionTool.tool_name
              });
            }
            
            return {
              ...solutionTool,
              details: toolDetails || null
            };
          } catch (error) {
            logError("Erro ao processar detalhes da ferramenta", {
              error,
              tool_name: solutionTool.tool_name
            });
            return solutionTool;
          }
        })
      );
      
      return toolsWithDetails;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando ferramentas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    logError("Erro ao exibir ferramentas", error);
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">Erro ao carregar ferramentas</p>
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma ferramenta específica</h3>
        <p className="text-neutral-400">Esta solução não requer ferramentas externas específicas.</p>
      </div>
    );
  }

  const requiredTools = tools.filter(tool => tool.is_required);
  const optionalTools = tools.filter(tool => !tool.is_required);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-viverblue/20 rounded-full mb-4">
          <div className="text-2xl">🛠️</div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent mb-4">
          Ferramentas Necessárias
        </h2>
        <p className="text-neutral-300 max-w-2xl mx-auto">
          Para implementar esta solução com sucesso, você precisará das seguintes ferramentas.
          Algumas são obrigatórias, outras são opcionais para melhorar seus resultados.
        </p>
      </div>

      {/* Required Tools */}
      {requiredTools.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Ferramentas Obrigatórias</h3>
            <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
              {requiredTools.length} {requiredTools.length === 1 ? 'ferramenta' : 'ferramentas'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requiredTools.map((tool, index) => (
              <ToolCard key={`required-${index}`} tool={tool} isRequired={true} />
            ))}
          </div>
        </div>
      )}

      {/* Optional Tools */}
      {optionalTools.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Ferramentas Opcionais</h3>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              {optionalTools.length} {optionalTools.length === 1 ? 'ferramenta' : 'ferramentas'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {optionalTools.map((tool, index) => (
              <ToolCard key={`optional-${index}`} tool={tool} isRequired={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ToolCardProps {
  tool: any;
  isRequired: boolean;
}

const ToolCard = ({ tool, isRequired }: ToolCardProps) => {
  const handleToolClick = () => {
    if (tool.tool_url) {
      window.open(tool.tool_url, '_blank');
    }
  };

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-viverblue/20 to-viverblue-dark/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
        {/* Tool Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-viverblue/20 rounded-lg flex items-center justify-center">
              <div className="text-xl">🔧</div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white group-hover:text-viverblue-light transition-colors">
                {tool.tool_name}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                {isRequired ? (
                  <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Obrigatória
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Opcional
                  </Badge>
                )}
                
                {tool.details?.has_member_benefit && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Desconto Membro
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tool Description */}
        {tool.details?.description && (
          <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
            {tool.details.description}
          </p>
        )}

        {/* Tool Features */}
        {tool.details?.features && tool.details.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {tool.details.features.slice(0, 3).map((feature: string, index: number) => (
                <span key={index} className="bg-viverblue/10 text-viverblue-light px-2 py-1 rounded-md text-xs">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Info */}
        {tool.details?.pricing_info && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Preço:</span>
              <span className="text-sm font-medium text-white">{tool.details.pricing_info}</span>
            </div>
            {tool.details?.has_member_benefit && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-yellow-400">Desconto Membro:</span>
                <span className="text-sm font-medium text-yellow-300">
                  {tool.details.benefit_type === 'discount' ? 'Desconto Especial' : 'Acesso Gratuito'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleToolClick}
          variant="outline"
          className="w-full border-viverblue/30 hover:bg-viverblue/10 hover:border-viverblue text-white group-hover:scale-105 transition-all duration-200"
          disabled={!tool.tool_url}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {tool.details?.has_member_benefit ? 'Acessar com Desconto' : 'Acessar Ferramenta'}
        </Button>
      </div>
    </div>
  );
};
