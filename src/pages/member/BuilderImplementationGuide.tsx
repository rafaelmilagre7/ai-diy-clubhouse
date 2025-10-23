import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Brain, CheckSquare, Network, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AutomationJourneyFlow } from '@/components/builder/flows/AutomationJourneyFlow';
import { AIArchitectureDecisionTree } from '@/components/builder/flows/AIArchitectureDecisionTree';
import { DeployChecklistAccordion } from '@/components/builder/flows/DeployChecklistAccordion';
import { APIIntegrationGraph } from '@/components/builder/flows/APIIntegrationGraph';
import { toast } from 'sonner';

export default function BuilderImplementationGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [solutionData, setSolutionData] = useState<any>(null);
  const [generatingFlows, setGeneratingFlows] = useState<Set<string>>(new Set());
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('automation');

  const { data: solution, isLoading } = useQuery({
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

  // Sincronizar solutionData com solution
  useEffect(() => {
    if (solution) {
      setSolutionData(solution);
    }
  }, [solution]);

  // Função para gerar fluxo sob demanda
  const generateFlowIfNeeded = async (flowType: string) => {
    const fieldMapping: Record<string, string> = {
      'automation': 'automation_journey_flow',
      'ai_arch': 'ai_architecture_tree',
      'checklist': 'deploy_checklist_structured',
      'api_map': 'api_integration_map'
    };

    const field = fieldMapping[flowType];
    
    // Se já tem conteúdo OU já tentou gerar, não faz nada
    if (!solutionData || solutionData[field] || hasAttemptedGeneration.has(flowType) || generatingFlows.has(flowType)) {
      return;
    }

    // Marcar como "tentando gerar"
    setHasAttemptedGeneration(prev => new Set([...prev, flowType]));
    setGeneratingFlows(prev => new Set([...prev, flowType]));

    const flowTypeMapping: Record<string, string> = {
      'automation': 'automation_journey',
      'ai_arch': 'ai_architecture',
      'checklist': 'deploy_checklist',
      'api_map': 'api_integration'
    };

    try {
      const { data, error } = await supabase.functions.invoke('generate-implementation-flows', {
        body: {
          solutionId: solutionData.id,
          flowType: flowTypeMapping[flowType],
          userId: solutionData.user_id
        }
      });

      if (error) throw error;

      if (data?.success) {
        setSolutionData((prev: any) => ({
          ...prev,
          [field]: data.content
        }));
        toast.success('Fluxo gerado com sucesso! 🎉');
      }
    } catch (err: any) {
      console.error('Erro ao gerar fluxo:', err);
      toast.error('Erro ao gerar fluxo', {
        description: 'Tente novamente em instantes.'
      });
      // Remover da lista de tentativas para permitir retry
      setHasAttemptedGeneration(prev => {
        const newSet = new Set(prev);
        newSet.delete(flowType);
        return newSet;
      });
    } finally {
      setGeneratingFlows(prev => {
        const newSet = new Set(prev);
        newSet.delete(flowType);
        return newSet;
      });
    }
  };

  // Gerar automaticamente ao trocar de aba
  useEffect(() => {
    if (activeTab && solutionData) {
      generateFlowIfNeeded(activeTab);
    }
  }, [activeTab, solutionData]);

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

  const renderFlowContent = (flowType: string, field: string, Component: any) => {
    const isGenerating = generatingFlows.has(flowType);
    const flowData = solutionData[field];

    if (isGenerating) {
      return (
        <div className="text-center py-16 space-y-4">
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
          <div className="space-y-2">
            <p className="font-semibold text-xl">Gerando fluxo...</p>
            <p className="text-muted-foreground">Isso pode levar até 30 segundos</p>
          </div>
        </div>
      );
    }

    if (!flowData) {
      return (
        <div className="text-center py-16 space-y-4">
          <div className="space-y-2">
            <p className="font-semibold text-xl">Fluxo não disponível</p>
            <p className="text-muted-foreground">Este fluxo ainda não foi gerado para esta solução</p>
          </div>
          <Button onClick={() => generateFlowIfNeeded(flowType)}>
            Gerar agora
          </Button>
        </div>
      );
    }

    return <Component data={flowData} solutionId={solutionData.id} />;
  };

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
                Fluxos acionáveis e práticos para implementar sua solução no-code com IA
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
                <TabsTrigger value="automation" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Jornada de Automação</span>
                  <span className="sm:hidden">Automação</span>
                </TabsTrigger>
                <TabsTrigger value="ai_arch" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Arquitetura IA</span>
                  <span className="sm:hidden">IA</span>
                </TabsTrigger>
                <TabsTrigger value="checklist" className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Checklist Deploy</span>
                  <span className="sm:hidden">Deploy</span>
                </TabsTrigger>
                <TabsTrigger value="api_map" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  <span className="hidden sm:inline">Mapa de APIs</span>
                  <span className="sm:hidden">APIs</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="automation">
                  {renderFlowContent('automation', 'automation_journey_flow', AutomationJourneyFlow)}
                </TabsContent>

                <TabsContent value="ai_arch">
                  {renderFlowContent('ai_arch', 'ai_architecture_tree', AIArchitectureDecisionTree)}
                </TabsContent>

                <TabsContent value="checklist">
                  {renderFlowContent('checklist', 'deploy_checklist_structured', DeployChecklistAccordion)}
                </TabsContent>

                <TabsContent value="api_map">
                  {renderFlowContent('api_map', 'api_integration_map', APIIntegrationGraph)}
                </TabsContent>
              </div>
            </Tabs>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
