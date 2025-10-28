import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ToolsLoading } from '@/components/implementation/content/tools/ToolsLoading';
import { RequiredToolsGrid } from '@/components/builder/RequiredToolsGrid';
import { useState } from 'react';

export default function BuilderSolutionTools() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState('Analisando solução...');

  // 🎯 Buscar ferramentas vinculadas via solution_tools com JOIN otimizado
  const { data: tools, isLoading } = useQuery<{ essential: any[], optional: any[] }>({
    queryKey: ['builder-solution-tools', id],
    queryFn: async () => {
      try {
        setLoadingStep('Buscando ferramentas vinculadas...');

        // ✅ OTIMIZADO: Buscar com JOIN direto (tool_id deve estar populado)
        const { data: solutionTools, error: toolsError } = await supabase
          .from('solution_tools')
          .select(`
            *,
            tool_details:tool_id (
              id,
              name,
              logo_url,
              category,
              description,
              official_url,
              has_member_benefit,
              benefit_title
            )
          `)
          .eq('solution_id', id)
          .order('order_index', { ascending: true });

        if (toolsError) {
          console.error('❌ Erro ao buscar solution_tools:', toolsError);
          throw toolsError;
        }

        if (!solutionTools || solutionTools.length === 0) {
          console.warn('⚠️ Nenhuma ferramenta vinculada a esta solução');
          return { essential: [], optional: [] };
        }

        setLoadingStep('Organizando ferramentas...');

        console.log(`✅ ${solutionTools.length} ferramentas vinculadas encontradas`);

        // Transformar para o formato RequiredToolsGrid
        const essential = solutionTools
          .filter(st => st.is_required)
          .map(st => {
            const details = st.tool_details as any;
            return {
              name: details?.name || st.tool_name,
              logo_url: details?.logo_url,
              category: details?.category || 'Outros',
              reason: details?.description || 'Ferramenta essencial para implementação',
              tool_url: st.tool_url || details?.official_url,
              tool_id: st.tool_id,
              has_benefit: details?.has_member_benefit || false,
              benefit_title: details?.benefit_title
            };
          });

        const optional = solutionTools
          .filter(st => !st.is_required)
          .map(st => {
            const details = st.tool_details as any;
            return {
              name: details?.name || st.tool_name,
              logo_url: details?.logo_url,
              category: details?.category || 'Outros',
              reason: details?.description || 'Ferramenta opcional recomendada',
              tool_url: st.tool_url || details?.official_url,
              tool_id: st.tool_id,
              has_benefit: details?.has_member_benefit || false,
              benefit_title: details?.benefit_title
            };
          });

        console.log('📊 Ferramentas organizadas:', {
          essenciais: essential.length,
          opcionais: optional.length
        });

        return { essential, optional };

      } catch (error) {
        console.error('❌ Erro crítico ao buscar ferramentas:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
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
