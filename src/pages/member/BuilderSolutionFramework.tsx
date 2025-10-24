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

  // Auto-geração se framework não existir com retry e timeout
  useEffect(() => {
    const generateIfNeeded = async () => {
      if (!solution || solution.framework_mapping || isGenerating) return;

      console.log('[FRAMEWORK] Framework não existe, gerando automaticamente...');
      setIsGenerating(true);

      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`[FRAMEWORK] 🚀 Tentativa ${attempts}/${maxAttempts} iniciada`);
          
          // Timeout de 90 segundos
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('[FRAMEWORK] ⏱️ Timeout atingido (90s)');
            controller.abort();
          }, 90000);

          const startTime = Date.now();

          const { data, error } = await supabase.functions.invoke('generate-section-content', {
            body: {
              solutionId: solution.id,
              sectionType: 'framework',
              userId: solution.user_id
            },
            headers: {
              'Content-Type': 'application/json'
            }
          });

          clearTimeout(timeoutId);
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          
          console.log(`[FRAMEWORK] 📦 Resposta recebida em ${elapsed}s:`, { 
            success: data?.success, 
            cached: data?.cached,
            hasContent: !!data?.content,
            error 
          });

          if (error) throw error;

          // SEMPRE faz refetch, independente da estrutura de resposta
          console.log('[FRAMEWORK] 🔄 Atualizando dados via refetch...');
          const refetchResult = await refetch();
          
          const hasFramework = !!refetchResult.data?.framework_mapping;
          console.log('[FRAMEWORK] ✅ Refetch completo:', hasFramework ? 'Framework encontrado!' : 'Framework ainda NULL');

          if (hasFramework) {
            toast.success('Framework gerado com sucesso! 🎉', {
              description: 'Os 4 pilares da sua solução foram mapeados.'
            });
            break; // Sucesso, sai do loop
          } else {
            // Framework gerado mas ainda não apareceu no refetch
            console.log('[FRAMEWORK] ⚠️ Framework não apareceu no refetch, aguardando...');
            toast.success('Framework processado!', {
              description: 'Recarregando em 2 segundos...'
            });
            setTimeout(() => window.location.reload(), 2000);
            break;
          }

        } catch (err: any) {
          console.error(`[FRAMEWORK] ❌ Erro na tentativa ${attempts}:`, {
            name: err.name,
            message: err.message,
            stack: err.stack
          });
          
          if (attempts >= maxAttempts) {
            // Última tentativa falhou
            if (err.name === 'AbortError') {
              toast.error('Tempo esgotado', {
                description: 'A geração demorou muito. Tente recarregar a página.',
                action: {
                  label: 'Recarregar',
                  onClick: () => window.location.reload()
                }
              });
            } else {
              toast.error('Erro ao gerar framework', {
                description: err.message || 'Tente recarregar a página.',
                action: {
                  label: 'Recarregar',
                  onClick: () => window.location.reload()
                }
              });
            }
          } else {
            // Tentar novamente
            console.log(`[FRAMEWORK] ⚠️ Tentativa ${attempts} falhou, aguardando 2s antes de retry...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      setIsGenerating(false);
    };

    generateIfNeeded();
  }, [solution, isGenerating]);

  if (isLoading) {
    return <LoadingScreen message="Carregando framework..." />;
  }

  if (isGenerating || !solution?.framework_mapping) {
    return (
      <LoadingScreen 
        message="Gerando Framework de Implementação" 
        description="Isso pode levar até 60 segundos. A IA está analisando sua solução em profundidade."
        showProgress={true}
        estimatedSeconds={50}
      />
    );
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
