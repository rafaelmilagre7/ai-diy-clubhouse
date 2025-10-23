import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FlowCard } from '@/components/builder/flows/FlowCard';
import { toast } from 'sonner';

export default function BuilderImplementationGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [solutionData, setSolutionData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);

  const { data: solution, isLoading, isError, error } = useQuery({
    queryKey: ['builder-solution-implementation', id],
    queryFn: async () => {
      console.log('🔍 [DEBUG-IMPL] Carregando solution com id:', id);
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ [DEBUG-IMPL] Erro ao carregar:', error);
        throw error;
      }
      
      console.log('✅ [DEBUG-IMPL] Solution carregada:', data?.title);
      return data;
    },
    retry: 1,
    staleTime: 30000
  });

  // Sincronizar solutionData com solution
  useEffect(() => {
    if (solution) {
      setSolutionData(solution);
    }
  }, [solution]);

  // Função para gerar todos os fluxos de uma vez
  const generateFlows = async () => {
    if (!solutionData || solutionData.implementation_flows || hasAttemptedGeneration || isGenerating) {
      return;
    }

    console.log('🔍 [DEBUG-IMPL] Gerando fluxos de implementação');
    setHasAttemptedGeneration(true);
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-section-content', {
        body: {
          solutionId: solutionData.id,
          sectionType: 'architecture',
          userId: solutionData.user_id
        }
      });

      if (error) throw error;

      if (data?.success) {
        console.log('✅ [DEBUG-IMPL] Fluxos gerados com sucesso');
        setSolutionData((prev: any) => ({
          ...prev,
          implementation_flows: data.content
        }));
        toast.success('Guia de implementação gerado! 🎉');
      } else {
        throw new Error('Resposta sem sucesso');
      }
    } catch (err: any) {
      console.error('❌ [DEBUG-IMPL] Erro ao gerar fluxos:', err);
      
      toast.error('Erro ao gerar guia', {
        description: 'Ocorreu um erro. Tente novamente em instantes.',
        action: {
          label: 'Tentar novamente',
          onClick: () => {
            setHasAttemptedGeneration(false);
            generateFlows();
          }
        },
        duration: 10000
      });
      
      setHasAttemptedGeneration(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar automaticamente ao carregar
  useEffect(() => {
    if (solutionData && !solutionData.implementation_flows && !hasAttemptedGeneration) {
      generateFlows();
    }
  }, [solutionData]);

  // ✅ FASE 2: Renderização explícita de erro
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 space-y-4">
          <p className="text-destructive font-semibold text-xl">Erro ao carregar solução</p>
          <p className="text-sm text-muted-foreground">{error?.message || 'Erro desconhecido'}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!solutionData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Solução não encontrada</p>
      </div>
    );
  }

  // Extrair os fluxos da solução
  const flows = solutionData?.implementation_flows?.flows || [];
  const prerequisites = solutionData?.implementation_flows?.prerequisites || '';
  const totalTime = solutionData?.implementation_flows?.total_estimated_time || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LiquidGlassCard className="p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para visão geral
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Guia de Implementação Prática
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Fluxos visuais detalhados para implementar sua solução passo a passo
              </p>
              
              {totalTime && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <strong>Tempo total estimado:</strong> {totalTime}
                </div>
              )}
              
              {prerequisites && (
                <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <strong className="text-sm">Pré-requisitos:</strong>
                  <p className="text-sm text-muted-foreground mt-1">{prerequisites}</p>
                </div>
              )}
            </div>

            {isGenerating ? (
              <div className="text-center py-16 space-y-4">
                <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
                <div className="space-y-2">
                  <p className="font-semibold text-xl">Gerando guia de implementação...</p>
                  <p className="text-muted-foreground">Isso pode levar até 30 segundos</p>
                </div>
              </div>
            ) : flows.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold text-xl">Guia não disponível</p>
                  <p className="text-muted-foreground">O guia de implementação ainda não foi gerado</p>
                </div>
                <Button onClick={generateFlows}>
                  Gerar agora
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {flows.map((flow: any, index: number) => (
                  <FlowCard key={flow.id || index} flow={flow} />
                ))}
              </div>
            )}
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
