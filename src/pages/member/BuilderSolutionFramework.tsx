import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { FrameworkQuadrants } from '@/components/builder/FrameworkQuadrants';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function BuilderSolutionFramework() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: solution, isLoading, refetch } = useQuery({
    queryKey: ['builder-solution', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Auto-geração se framework não existir
  useEffect(() => {
    const generateIfNeeded = async () => {
      if (!solution || solution.framework_mapping || isGenerating) return;

      console.log('[FRAMEWORK] Framework não existe, gerando automaticamente...');
      setIsGenerating(true);

      try {
        const { data, error } = await supabase.functions.invoke('generate-section-content', {
          body: {
            solutionId: solution.id,
            sectionType: 'framework',
            userId: solution.user_id
          }
        });

        if (error) throw error;

        if (data?.success) {
          console.log('[FRAMEWORK] ✅ Framework gerado!');
          toast.success('Framework gerado com sucesso! 🎉');
          await refetch();
        }
      } catch (err: any) {
        console.error('[FRAMEWORK] Erro:', err);
        toast.error('Erro ao gerar framework', {
          description: 'Tente recarregar a página.',
          action: {
            label: 'Voltar',
            onClick: () => navigate(`/ferramentas/builder/solution/${id}`)
          }
        });
      } finally {
        setIsGenerating(false);
      }
    };

    generateIfNeeded();
  }, [solution, isGenerating]);

  if (isLoading) {
    return <LoadingScreen message="Carregando framework..." />;
  }

  if (isGenerating || !solution?.framework_mapping) {
    return <LoadingScreen message="Gerando Framework de Implementação..." />;
  }

  if (!solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Solução não encontrada</p>
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
          <LiquidGlassCard className="p-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
              className="mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para visão geral
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Framework de Implementação de IA
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="text-base px-4 py-1.5 bg-surface-elevated/90 text-foreground border-aurora/40 border-2 shadow-sm">
                  by Rafael Milagre
                </Badge>
              </div>
              <p className="text-foreground/80 text-lg leading-relaxed">
                Os 4 pilares essenciais da sua solução com Inteligência Artificial
              </p>
            </div>

            <FrameworkQuadrants framework={solution.framework_mapping} />
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
