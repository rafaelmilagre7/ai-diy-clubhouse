import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import UnifiedChecklistTab from '@/components/unified-checklist/UnifiedChecklistTab';
import ChecklistPreparationAnimation from '@/components/builder/ChecklistPreparationAnimation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BuilderSolutionChecklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hasTimeout, setHasTimeout] = useState(false);

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

  // Verificar se já existe checklist com polling agressivo (refetch a cada 1s)
  const { data: existingChecklist } = useQuery({
    queryKey: ['unified-checklist-exists', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_checklists')
        .select('id')
        .eq('solution_id', id)
        .eq('checklist_type', 'implementation')
        .eq('is_template', false)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !hasTimeout,
    staleTime: 0, // Forçar re-fetch imediato
    refetchInterval: (query) => {
      // Parar de fazer polling quando encontrar o checklist
      return query.state.data ? false : 1000; // 1s em vez de 3s
    },
  });

  // Timeout de 3 minutos para detectar falhas
  useEffect(() => {
    if (existingChecklist || hasTimeout) return;

    const timeout = setTimeout(() => {
      console.error('[CHECKLIST] ⏱️ Timeout de 3 minutos atingido');
      setHasTimeout(true);
      toast.error('A geração está demorando mais que o esperado', {
        description: 'Por favor, tente novamente ou entre em contato com o suporte.',
        duration: 10000,
      });
    }, 180000); // 3 minutos

    return () => clearTimeout(timeout);
  }, [existingChecklist, hasTimeout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Solução não encontrada</p>
      </div>
    );
  }

  // Se não existe checklist, mostrar animação de preparação
  const showPreparation = !existingChecklist;

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
                Plano de Ação
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {showPreparation 
                  ? 'Gerando seu plano personalizado...' 
                  : 'Checklist prático e passo a passo para transformar sua ideia em realidade'
                }
              </p>
            </div>

            {showPreparation ? (
              hasTimeout ? (
                <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⏱️</div>
                    <h3 className="text-2xl font-bold">Tempo limite excedido</h3>
                    <p className="text-muted-foreground">
                      A geração do plano está demorando mais que o esperado. 
                      Isso pode indicar um problema temporário.
                    </p>
                    <div className="flex gap-3 justify-center pt-4">
                      <Button
                        onClick={() => {
                          setHasTimeout(false);
                          window.location.reload();
                        }}
                        size="lg"
                      >
                        Tentar novamente
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
                        size="lg"
                      >
                        Voltar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <ChecklistPreparationAnimation />
              )
            ) : (
              <UnifiedChecklistTab
                solutionId={id || ''}
                checklistType="implementation"
                onComplete={() => {
                  toast.success('Parabéns! Você completou todos os passos!');
                }}
              />
            )}
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
