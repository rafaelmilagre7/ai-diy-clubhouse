import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ToolsLoading } from '@/components/implementation/content/tools/ToolsLoading';
import { ToolItem } from '@/components/implementation/content/tools/ToolItem';
import type { Tool, SolutionTool } from '@/types/toolTypes';
import { useState } from 'react';

// Funções auxiliares para matching flexível de nomes
const normalizeName = (name: string) => 
  name.toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove (parênteses)
    .trim();

const findToolByName = (name: string, tools: Tool[] | null) => {
  if (!tools) return null;
  const normalized = normalizeName(name);
  return tools.find(t => 
    normalizeName(t.name) === normalized ||
    normalizeName(t.name).includes(normalized) ||
    normalized.includes(normalizeName(t.name))
  );
};

export default function BuilderSolutionTools() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState('Analisando solução...');

  // Buscar ferramentas da plataforma conectadas a essa solução
  const { data: tools, isLoading } = useQuery<(SolutionTool & { details: Tool | null })[]>({
    queryKey: ['builder-solution-tools', id],
    queryFn: async () => {
      try {
        setLoadingStep('Buscando ferramentas vinculadas...');

        // ✅ FASE 1: Buscar solution_tools (sem JOIN inválido)
        const { data: solutionTools, error: toolsError } = await supabase
          .from('solution_tools')
          .select('*')
          .eq('solution_id', id);

        if (toolsError) throw toolsError;

        // ✅ FASE 2: Se vazio, buscar do JSONB required_tools
        if (!solutionTools || solutionTools.length === 0) {
          setLoadingStep('Carregando ferramentas do builder...');

          const { data: aiSolution, error: solutionError } = await supabase
            .from('ai_generated_solutions')
            .select('required_tools')
            .eq('id', id)
            .maybeSingle();

          if (solutionError) throw solutionError;

          if (!aiSolution?.required_tools) {
            return [];
          }

          // Extrair nomes das ferramentas (essenciais + opcionais)
          const toolNames = [
            ...(aiSolution.required_tools.essential || []).map((t: any) => t.name),
            ...(aiSolution.required_tools.optional || []).map((t: any) => t.name)
          ];

          if (toolNames.length === 0) {
            return [];
          }

          setLoadingStep('Carregando ferramentas da plataforma...');

          // ✅ FASE 3: Buscar ferramentas da plataforma em BATCH (1 query única)
          const { data: platformTools, error: platformError } = await supabase
            .from('tools')
            .select('*')
            .eq('status', true);

          if (platformError) throw platformError;

          setLoadingStep('Organizando dados...');

          // ✅ FASE 4: Merge manual com matching flexível
          const mergedTools = toolNames.map(name => {
            const platformTool = findToolByName(name, platformTools);
            const isEssential = aiSolution.required_tools.essential?.some((t: any) => 
              normalizeName(t.name) === normalizeName(name)
            );

            return {
              id: platformTool?.id || crypto.randomUUID(),
              solution_id: id as string,
              tool_name: name,
              tool_url: platformTool?.official_url || '#',
              is_required: isEssential || false,
              order_index: 0,
              created_at: new Date().toISOString(),
              details: platformTool
            };
          });

          return mergedTools;
        }

        // ✅ Se houver solution_tools, buscar detalhes das ferramentas em BATCH
        setLoadingStep('Carregando detalhes das ferramentas...');

        const toolNames = solutionTools.map(st => st.tool_name).filter(Boolean);

        if (toolNames.length === 0) {
          return solutionTools.map(st => ({ ...st, details: null }));
        }

        const { data: platformTools, error: platformError } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true);

        if (platformError) throw platformError;

        // Merge manual com matching flexível
        return solutionTools.map(st => ({
          ...st,
          details: findToolByName(st.tool_name, platformTools)
        }));

      } catch (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <ToolsLoading message={loadingStep} />
        </div>
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma ferramenta vinculada a essa solução</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              🔧 Ferramentas Necessárias
            </h1>
            <p className="text-foreground/70 text-lg">
              Stack completo para implementar sua solução
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolItem
                key={tool.id}
                toolName={tool.details?.name || tool.tool_name}
                toolUrl={tool.details?.official_url || tool.tool_url}
                toolId={tool.details?.id}
                isRequired={tool.is_required}
                hasBenefit={tool.details?.has_member_benefit}
                benefitType={tool.details?.benefit_type as any}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
