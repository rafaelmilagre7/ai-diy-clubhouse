import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ToolsLoading } from '@/components/implementation/content/tools/ToolsLoading';
import { RequiredToolsGrid } from '@/components/builder/RequiredToolsGrid';
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

// Extrair dados específicos do JSONB required_tools
const extractFromJson = (toolName: string, field: string, requiredToolsJson: any) => {
  if (!requiredToolsJson) return undefined;
  
  const allTools = [
    ...(requiredToolsJson.essential || []),
    ...(requiredToolsJson.optional || [])
  ];
  
  const tool = allTools.find((t: any) => 
    normalizeName(t.name) === normalizeName(toolName)
  );
  
  return tool?.[field];
};

export default function BuilderSolutionTools() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState('Analisando solução...');

  // Buscar ferramentas da plataforma conectadas a essa solução
  const { data: tools, isLoading } = useQuery<{ essential: any[], optional: any[], requiredToolsJson?: any }>({
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
            return { essential: [], optional: [] };
          }

          setLoadingStep('Carregando ferramentas da plataforma...');

          // ✅ FASE 3: Buscar ferramentas da plataforma em BATCH (1 query única)
          const { data: platformTools, error: platformError } = await supabase
            .from('tools')
            .select('*')
            .eq('status', true);

          if (platformError) throw platformError;

          setLoadingStep('Organizando dados...');

          // ✅ FASE 4: Transformar para o formato do RequiredToolsGrid
          const essentialTools = (aiSolution.required_tools.essential || []).map((jsonTool: any) => {
            const platformTool = findToolByName(jsonTool.name, platformTools);
            
            return {
              name: jsonTool.name,
              logo_url: platformTool?.logo_url || jsonTool.logo_url,
              category: platformTool?.category || jsonTool.category || 'Outros',
              reason: platformTool?.description || (jsonTool.reason?.substring(0, 150) + '...') || 'Ferramenta essencial para a implementação',
              setup_complexity: jsonTool.setup_complexity,
              cost_estimate: jsonTool.estimated_cost,
              tool_id: platformTool?.id
            };
          });

          const optionalTools = (aiSolution.required_tools.optional || []).map((jsonTool: any) => {
            const platformTool = findToolByName(jsonTool.name, platformTools);
            
            return {
              name: jsonTool.name,
              logo_url: platformTool?.logo_url || jsonTool.logo_url,
              category: platformTool?.category || jsonTool.category || 'Outros',
              reason: platformTool?.description || (jsonTool.reason?.substring(0, 150) + '...') || 'Ferramenta opcional recomendada',
              setup_complexity: jsonTool.setup_complexity,
              cost_estimate: jsonTool.estimated_cost,
              tool_id: platformTool?.id
            };
          });

          return {
            essential: essentialTools,
            optional: optionalTools,
            requiredToolsJson: aiSolution.required_tools
          };
        }

        // ✅ Se houver solution_tools, buscar detalhes das ferramentas em BATCH
        setLoadingStep('Carregando detalhes das ferramentas...');

        const toolNames = solutionTools.map(st => st.tool_name).filter(Boolean);

        if (toolNames.length === 0) {
          return { essential: [], optional: [] };
        }

        const { data: platformTools, error: platformError } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true);

        if (platformError) throw platformError;

        // Transformar solution_tools para o formato RequiredToolsGrid
        const essential = solutionTools
          .filter(st => st.is_required)
          .map(st => {
            const platformTool = findToolByName(st.tool_name, platformTools);
            return {
              name: st.tool_name,
              logo_url: platformTool?.logo_url,
              category: platformTool?.category || 'Outros',
              reason: 'Ferramenta vinculada à solução',
              setup_complexity: undefined,
              cost_estimate: undefined
            };
          });

        const optional = solutionTools
          .filter(st => !st.is_required)
          .map(st => {
            const platformTool = findToolByName(st.tool_name, platformTools);
            return {
              name: st.tool_name,
              logo_url: platformTool?.logo_url,
              category: platformTool?.category || 'Outros',
              reason: 'Ferramenta vinculada à solução',
              setup_complexity: undefined,
              cost_estimate: undefined
            };
          });

        return { essential, optional };

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

  if (!tools || (!tools.essential?.length && !tools.optional?.length)) {
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

          <RequiredToolsGrid tools={tools} />
        </motion.div>
      </div>
    </div>
  );
}
