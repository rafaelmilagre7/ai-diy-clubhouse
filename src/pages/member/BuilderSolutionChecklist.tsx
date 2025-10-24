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
import { useUnifiedChecklistTemplate } from '@/hooks/useUnifiedChecklists';

export default function BuilderSolutionChecklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hasTimeout, setHasTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

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

  // ✅ Usar hook unificado com fallback inteligente
  const { data: template, isLoading: isLoadingTemplate } = useUnifiedChecklistTemplate(
    id || '', 
    'implementation'
  );
  
  const existingChecklist = template;

  // ⏱️ FASE 1: Timeout de 5 minutos (margem segura)
  useEffect(() => {
    if (existingChecklist || hasTimeout) return;

    const timeout = setTimeout(() => {
      console.error('[CHECKLIST] ⏱️ Timeout de 5 minutos atingido');
      setHasTimeout(true);
      toast.error('A geração está demorando mais que o esperado', {
        description: 'Por favor, tente novamente ou entre em contato com o suporte.',
        duration: 10000,
      });
    }, 300000); // 🛡️ FASE 1: 5 minutos

    return () => clearTimeout(timeout);
  }, [existingChecklist, hasTimeout]);

  // 🔄 FASE 3: Retry automático com backoff
  useEffect(() => {
    if (hasTimeout && retryCount < MAX_RETRIES && !existingChecklist) {
      console.log(`[CHECKLIST] 🔄 Retry ${retryCount + 1}/${MAX_RETRIES}`);
      
      toast.info('Tentando novamente...', {
        description: `Tentativa ${retryCount + 1} de ${MAX_RETRIES}`,
        duration: 3000
      });
      
      setRetryCount(prev => prev + 1);
      setHasTimeout(false);
      
      // Re-disparar geração + INVALIDAR CACHE
      supabase.functions.invoke('generate-section-content', {
        body: {
          solutionId: id,
          sectionType: 'checklist',
          userId: solution?.user_id
        }
      }).then(() => {
        // ✨ FASE 1: Invalidar cache após geração
        console.log('[CHECKLIST] 🔄 Invalidando cache após geração...');
        queryClient.invalidateQueries({ 
          queryKey: ['unified-checklist-template', id, 'implementation'] 
        });
      });
    }
  }, [hasTimeout, retryCount, existingChecklist, id, solution?.user_id, queryClient]);

  // 📝 FASE 4: Logging detalhado
  useEffect(() => {
    if (existingChecklist) {
      console.log('[CHECKLIST] ✅ Checklist encontrado via hook unificado!', {
        id: existingChecklist.id,
        isTemplate: existingChecklist.is_template,
        items: existingChecklist.checklist_data?.items?.length || 0,
        createdAt: existingChecklist.created_at
      });
    } else if (!hasTimeout) {
      console.log('[CHECKLIST] ⏳ Aguardando geração...', {
        solutionId: id,
        retryCount,
        timeout: hasTimeout,
        isLoadingTemplate
      });
    }
  }, [existingChecklist, hasTimeout, id, retryCount, isLoadingTemplate]);

  // 🔄 FASE 2: Polling inteligente - refetch a cada 3s até encontrar checklist
  useEffect(() => {
    if (!existingChecklist && !hasTimeout && !isLoadingTemplate) {
      console.log('[CHECKLIST] 🔄 Iniciando polling (refetch a cada 3s)...');
      
      const intervalId = setInterval(() => {
        console.log('[CHECKLIST] 🔄 Polling: invalidando cache...');
        queryClient.invalidateQueries({ 
          queryKey: ['unified-checklist-template', id, 'implementation'] 
        });
      }, 3000); // Refetch a cada 3 segundos

      return () => {
        console.log('[CHECKLIST] 🛑 Parando polling (checklist encontrado ou timeout)');
        clearInterval(intervalId);
      };
    }
  }, [existingChecklist, hasTimeout, isLoadingTemplate, queryClient, id]);

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
        <div 
          className="animate-fade-in"
        >
          <LiquidGlassCard className="p-6 liquid-glass-kanban-container">
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
                  ? existingChecklist 
                    ? 'Carregando seu plano...' 
                    : `Gerando seu plano personalizado... ${retryCount > 0 ? `(Tentativa ${retryCount + 1})` : '(30-60s)'}` 
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
        </div>
      </div>
    </div>
  );
}
