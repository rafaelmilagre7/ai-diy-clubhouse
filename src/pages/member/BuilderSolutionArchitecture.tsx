import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SmartArchitectureFlow } from '@/components/builder/flows/SmartArchitectureFlow';
import { ArchitectureInsights } from '@/components/builder/architecture/ArchitectureInsights';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export default function BuilderSolutionArchitecture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: solution, isLoading, refetch } = useQuery({
    queryKey: ['builder-solution-architecture', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const generateArchitecture = async () => {
    if (!solution || !user) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-architecture-flow', {
        body: { solutionId: solution.id, userId: user.id }
      });

      if (error) throw error;

      toast.success('Arquitetura inteligente gerada! 🎉');
      refetch();
    } catch (err: any) {
      console.error('Erro ao gerar arquitetura:', err);
      toast.error('Erro ao gerar arquitetura');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (solution && !solution.implementation_flows && !isGenerating) {
      generateArchitecture();
    }
  }, [solution]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const flows = solution?.implementation_flows?.flows || [];
  const insights = solution?.architecture_insights;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <LiquidGlassCard className="p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Arquitetura e Fluxos Inteligentes
              </h1>
              <p className="text-muted-foreground text-lg">
                Fluxos técnicos, análise de IA e estimativa de custos
              </p>
            </div>

            {isGenerating ? (
              <div className="text-center py-16 space-y-4">
                <Sparkles className="h-16 w-16 mx-auto animate-pulse text-primary" />
                <p className="font-semibold text-xl">Gerando arquitetura inteligente...</p>
                <p className="text-muted-foreground">Analisando RAG, APIs, CRM e custos</p>
              </div>
            ) : flows.length === 0 ? (
              <div className="text-center py-16">
                <Button onClick={generateArchitecture}>Gerar Arquitetura</Button>
              </div>
            ) : (
              <div className="space-y-8">
                {insights && <ArchitectureInsights insights={insights} />}
                
                {flows.map((flow: any) => (
                  <SmartArchitectureFlow
                    key={flow.id}
                    flow={flow}
                    solutionId={solution.id}
                    userId={user?.id || ''}
                  />
                ))}
              </div>
            )}
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
