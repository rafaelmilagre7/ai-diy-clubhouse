import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnifiedChecklistTab from '@/components/unified-checklist/UnifiedChecklistTab';
import { UnifiedLoadingScreen } from '@/components/common/UnifiedLoadingScreen';
import { getLoadingMessages } from '@/lib/loadingMessages';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useUnifiedChecklistTemplate, useUnifiedChecklist } from '@/hooks/useUnifiedChecklists';

export default function BuilderSolutionChecklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hasTimeout, setHasTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  // 🔥 INVALIDAR CACHE ao montar o componente (forçar reload)
  useEffect(() => {
    console.log('🔥 [BuilderSolutionChecklist] MOUNT - Invalidando TODOS os caches relacionados');
    queryClient.invalidateQueries({ 
      queryKey: ['unified-checklist'] // Invalida QUALQUER query que comece com unified-checklist
    });
    queryClient.invalidateQueries({ 
      queryKey: ['unified-checklist-template'] 
    });
  }, [id, queryClient]);

  // 🔐 VERIFICAÇÃO DE PERMISSÕES (DEBUG RLS)
  useEffect(() => {
    const verifyPermissions = async () => {
      try {
        console.log('🔐 [Verificação RLS] Iniciando...');
        
        // 1. Verificar auth.uid()
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('🔐 [Verificação RLS] Auth user:', {
          userId: user?.id,
          email: user?.email,
          authError: authError?.message
        });

        if (!user?.id) {
          console.error('❌ [Verificação RLS] Usuário não autenticado!');
          return;
        }

        // 2. Testar SELECT simples
        const { data: testData, error: testError } = await supabase
          .from('unified_checklists')
          .select('id, user_id, checklist_type, is_template')
          .eq('solution_id', id)
          .limit(5);

        console.log('🔐 [Verificação RLS] Teste SELECT:', {
          success: !testError,
          recordsFound: testData?.length || 0,
          error: testError ? {
            code: testError.code,
            message: testError.message,
            details: testError.details,
            hint: testError.hint
          } : null
        });

        // 3. Verificar se pode ler templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('unified_checklists')
          .select('id')
          .eq('is_template', true)
          .limit(1);

        console.log('🔐 [Verificação RLS] Templates públicos:', {
          canReadTemplates: !templatesError,
          templatesFound: templatesData?.length || 0,
          error: templatesError?.message
        });

      } catch (err) {
        console.error('❌ [Verificação RLS] Erro inesperado:', err);
      }
    };

    verifyPermissions();
  }, [id]);

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

  // ✅ Buscar AMBOS: template E progresso do usuário
  const { data: template, isLoading: isLoadingTemplate } = useUnifiedChecklistTemplate(
    id || '', 
    'implementation'
  );
  
  const { data: userProgress, isLoading: isLoadingProgress } = useUnifiedChecklist(
    id || '',
    'implementation'
  );

  const isLoadingChecklists = isLoadingTemplate || isLoadingProgress;
  
  // Se tem progresso do usuário, usar ele. Senão, usar template
  const existingChecklist = userProgress || template;
  
  console.log('🔍 [BuilderSolutionChecklist] Estado atual:', {
    isLoading,
    isLoadingTemplate,
    isLoadingProgress,
    isLoadingChecklists,
    hasTemplate: !!template,
    hasUserProgress: !!userProgress,
    hasExistingChecklist: !!existingChecklist,
    usingData: userProgress ? 'USER_PROGRESS' : template ? 'TEMPLATE' : 'NENHUM',
    checklistId: existingChecklist?.id,
    solutionId: id,
    userProgressItemsCount: userProgress?.checklist_data?.items?.length,
    templateItemsCount: template?.checklist_data?.items?.length
  });

  // ⏱️ FASE 1: Timeout de 5 minutos (margem segura)
  useEffect(() => {
    // Se já tem checklist OU já atingiu timeout, não fazer nada
    if (existingChecklist || hasTimeout) return;
    
    // Se ainda está carregando, não iniciar timeout
    if (isLoadingChecklists) return;

    const timeout = setTimeout(() => {
      console.error('[CHECKLIST] ⏱️ Timeout de 5 minutos atingido');
      setHasTimeout(true);
      toast.error('A geração está demorando mais que o esperado', {
        description: 'Por favor, tente novamente ou entre em contato com o suporte.',
        duration: 10000,
      });
    }, 300000); // 🛡️ FASE 1: 5 minutos

    return () => clearTimeout(timeout);
  }, [existingChecklist, hasTimeout, isLoadingChecklists]);

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
        isLoadingChecklists
      });
    }
  }, [existingChecklist, hasTimeout, id, retryCount, isLoadingChecklists]);

  // 🔄 FASE 2: Polling inteligente - refetch a cada 3s até encontrar checklist
  useEffect(() => {
    if (!existingChecklist && !hasTimeout && !isLoadingChecklists) {
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
  }, [existingChecklist, hasTimeout, isLoadingChecklists, queryClient, id]);

  // 🔄 Mostrar loading enquanto carrega solution OU enquanto não tem checklist e está carregando
  const showLoading = isLoading || (!existingChecklist && isLoadingChecklists);

  if (showLoading) {
    console.log('[CHECKLIST] 🔄 Estado de loading:', {
      isLoading,
      isLoadingChecklists,
      hasChecklist: !!existingChecklist
    });
    
    return (
      <UnifiedLoadingScreen
        title={isLoading ? "Carregando solução..." : "Carregando plano de ação..."}
        messages={getLoadingMessages(isLoading ? 'solutions' : 'builder_checklist')}
        estimatedSeconds={isLoading ? 10 : 15}
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

  // Se não existe checklist E não está carregando, mostrar erro
  const showPreparation = !existingChecklist && isLoadingChecklists;
  const showError = !existingChecklist && !isLoadingChecklists && !hasTimeout;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8">
        <div 
          className="animate-fade-in"
        >
          <div className="p-6 rounded-2xl border border-border bg-card/95 shadow-lg">
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

            {showError ? (
              <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="text-center space-y-4 max-w-md">
                  <div className="text-6xl">📋</div>
                  <h3 className="text-2xl font-bold">Plano de Ação não disponível</h3>
                  <p className="text-muted-foreground">
                    O plano de ação para esta solução ainda não foi criado. 
                    Clique no botão abaixo para gerar um novo plano.
                  </p>
                  <div className="flex gap-3 justify-center pt-4">
                    <Button
                      onClick={() => {
                        console.log('[CHECKLIST] Gerando novo plano via edge function');
                        supabase.functions.invoke('generate-section-content', {
                          body: {
                            solutionId: id,
                            sectionType: 'checklist',
                            userId: solution?.user_id
                          }
                        }).then(() => {
                          toast.success('Geração iniciada! Aguarde alguns segundos...');
                          setTimeout(() => {
                            queryClient.invalidateQueries({ 
                              queryKey: ['unified-checklist-template', id, 'implementation'] 
                            });
                          }, 3000);
                        }).catch(err => {
                          console.error('[CHECKLIST] Erro ao gerar:', err);
                          toast.error('Erro ao iniciar geração');
                        });
                      }}
                      size="lg"
                    >
                      Gerar Plano de Ação
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
            ) : showPreparation ? (
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
                <UnifiedLoadingScreen 
                  title="Gerando Plano de Ação..."
                  messages={getLoadingMessages('builder_checklist')}
                  estimatedSeconds={35}
                />
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
          </div>
        </div>
      </div>
    </div>
  );
}
