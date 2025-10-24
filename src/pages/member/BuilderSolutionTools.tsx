import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ToolItem } from '@/components/implementation/content/tools/ToolItem';
import type { Tool, SolutionTool } from '@/types/toolTypes';

export default function BuilderSolutionTools() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Buscar ferramentas da plataforma conectadas a essa solução
  const { data: tools, isLoading } = useQuery<(SolutionTool & { details: Tool | null })[]>({
    queryKey: ['builder-solution-tools', id],
    queryFn: async () => {
      // Buscar solution_tools com join para tools
      const { data: solutionTools, error } = await supabase
        .from('solution_tools')
        .select(`
          *,
          details:tool_name (
            id,
            name,
            logo_url,
            category,
            official_url,
            has_member_benefit,
            benefit_type,
            benefit_title,
            benefit_description,
            benefit_link,
            video_tutorials
          )
        `)
        .eq('solution_id', id);

      if (error) throw error;

      // Se não tiver dados, tentar popular da tabela tools comparando por nome
      if (!solutionTools || solutionTools.length === 0) {
        console.log('Nenhuma ferramenta vinculada, buscando da tabela tools...');
        
        // Buscar a solução para pegar required_tools
        const { data: solution } = await supabase
          .from('ai_generated_solutions')
          .select('required_tools')
          .eq('id', id)
          .single();

        if (solution?.required_tools) {
          const allTools = [
            ...(solution.required_tools.essential || []),
            ...(solution.required_tools.optional || [])
          ];

          // Para cada ferramenta no JSON, buscar na tabela tools
          const toolsFromPlatform = await Promise.all(
            allTools.map(async (tool: any) => {
              const { data: platformTool } = await supabase
                .from('tools')
                .select('*')
                .ilike('name', `%${tool.name}%`)
                .limit(1)
                .single();

              return {
                id: crypto.randomUUID(),
                solution_id: id as string,
                tool_name: tool.name,
                tool_url: platformTool?.official_url || tool.url,
                is_required: solution.required_tools.essential?.some((t: any) => t.name === tool.name) || false,
                order_index: 0,
                created_at: new Date().toISOString(),
                details: platformTool
              };
            })
          );

          return toolsFromPlatform.filter(t => t.details !== null);
        }
      }

      return solutionTools || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando ferramentas da plataforma..." />;
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
