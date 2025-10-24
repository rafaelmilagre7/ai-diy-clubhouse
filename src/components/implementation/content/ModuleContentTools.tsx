
import React, { useState } from "react";
import { Module, supabase } from "@/lib/supabase";
import { ToolsLoading } from "./tools/ToolsLoading";
import { ToolItem } from "./tools/ToolItem";
import { useQuery } from "@tanstack/react-query";
import { useLogging } from "@/hooks/useLogging";

// Função auxiliar para normalizar nomes de ferramentas
const normalizeName = (name: string) => 
  name.toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove (parênteses)
    .trim();

// Função para encontrar ferramenta por nome (matching flexível)
const findToolByName = (name: string, tools: any[]) => {
  const normalized = normalizeName(name);
  return tools.find(t => 
    normalizeName(t.name) === normalized ||
    normalizeName(t.name).includes(normalized) ||
    normalized.includes(normalizeName(t.name))
  );
};

interface ModuleContentToolsProps {
  module: Module;
}

export const ModuleContentTools = ({ module }: ModuleContentToolsProps) => {
  const { log, logError } = useLogging();
  const [loadingStep, setLoadingStep] = useState<string>('');

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['solution-tools', module.solution_id],
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        // FASE 1: Buscar solution_tools
        setLoadingStep('Analisando solução...');
        log("Buscando ferramentas da solução", { solution_id: module.solution_id });
        
        const { data: solutionTools, error: toolsError } = await supabase
          .from("solution_tools")
          .select('*')
          .eq("solution_id", module.solution_id)
          .order("order_index");
        
        if (toolsError) {
          logError("Erro ao buscar solution_tools", toolsError);
        }

        // Se não houver solution_tools, buscar do JSONB required_tools
        if (!solutionTools || solutionTools.length === 0) {
          log("Nenhum solution_tools encontrado, buscando ai_generated_solutions");
          
          const { data: aiSolution, error: aiError } = await supabase
            .from('ai_generated_solutions')
            .select('required_tools')
            .eq('id', module.solution_id)
            .maybeSingle();
          
          if (aiError) {
            logError("Erro ao buscar ai_generated_solutions", aiError);
            throw aiError;
          }

          if (!aiSolution?.required_tools) {
            log("Nenhuma ferramenta encontrada");
            return [];
          }

          // Extrair nomes das ferramentas do JSON
          const requiredTools = aiSolution.required_tools as any;
          const toolNames = [
            ...(requiredTools.essential || []).map((t: any) => t.name),
            ...(requiredTools.optional || []).map((t: any) => t.name)
          ];

          if (toolNames.length === 0) {
            return [];
          }

          // FASE 2: Buscar ferramentas da plataforma em BATCH
          setLoadingStep('Carregando ferramentas da plataforma...');
          
          const { data: platformTools, error: platformError } = await supabase
            .from('tools')
            .select('*')
            .eq('status', true);
          
          if (platformError) {
            logError("Erro ao buscar tools da plataforma", platformError);
          }

          setLoadingStep('Organizando dados...');
          
          // FASE 3 & 4: Fazer merge com matching flexível e fallback
          const mergedTools = toolNames.map((name: string) => {
            const platformTool = findToolByName(name, platformTools || []);
            const jsonTool = [...(requiredTools.essential || []), ...(requiredTools.optional || [])]
              .find((t: any) => normalizeName(t.name) === normalizeName(name));
            
            const isEssential = (requiredTools.essential || []).some(
              (t: any) => normalizeName(t.name) === normalizeName(name)
            );
            
            return {
              id: platformTool?.id || crypto.randomUUID(),
              tool_name: name,
              tool_url: platformTool?.official_url || jsonTool?.official_url || '#',
              is_required: isEssential,
              details: platformTool || {
                id: crypto.randomUUID(),
                name: name,
                logo_url: jsonTool?.logo_url || null,
                has_member_benefit: false,
                benefit_type: 'standard',
                official_url: jsonTool?.official_url || '#'
              }
            };
          });

          const endTime = performance.now();
          log("Ferramentas carregadas do JSON", { 
            count: mergedTools.length,
            queryTime: `${(endTime - startTime).toFixed(0)}ms`
          });

          return mergedTools;
        }

        // Se houver solution_tools, buscar detalhes em batch
        setLoadingStep('Carregando ferramentas da plataforma...');
        
        const toolNames = solutionTools.map(st => st.tool_name);
        const { data: platformTools, error: platformError } = await supabase
          .from('tools')
          .select('*')
          .in('name', toolNames)
          .eq('status', true);
        
        if (platformError) {
          logError("Erro ao buscar tools", platformError);
        }

        setLoadingStep('Organizando dados...');

        const mergedTools = solutionTools.map(st => ({
          ...st,
          details: findToolByName(st.tool_name, platformTools || []) || null
        }));

        const endTime = performance.now();
        log("Ferramentas carregadas", { 
          count: mergedTools.length,
          queryTime: `${(endTime - startTime).toFixed(0)}ms`
        });

        return mergedTools;
        
      } catch (error) {
        logError("Erro ao carregar ferramentas", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });

  if (error) {
    logError("Erro ao exibir ferramentas", error);
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Ferramentas Necessárias</h3>
        <ToolsLoading message={loadingStep} />
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    log("Nenhuma ferramenta encontrada para esta solução", { solution_id: module.solution_id });
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-aurora-primary/20 to-aurora-primary-dark/20 rounded-lg blur opacity-25"></div>
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-white via-aurora-primary-light to-aurora-primary bg-clip-text text-transparent">
            Ferramentas Necessárias
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Para implementar esta solução, você precisará das seguintes ferramentas:
          </p>
        </div>
      </div>
      
      {/* Enhanced Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <div key={tool.id} className="relative group">
            {/* Tool card glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-aurora-primary/10 to-aurora-primary-dark/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative">
              <ToolItem 
                toolName={tool.tool_name}
                toolUrl={tool.tool_url || ""}
                toolId={tool.details?.id}
                logoUrl={tool.details?.logo_url}
                isRequired={tool.is_required} 
                hasBenefit={tool.details?.has_member_benefit}
                benefitType={tool.details?.benefit_type as any}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
