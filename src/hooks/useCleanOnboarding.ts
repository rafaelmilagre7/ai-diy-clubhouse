import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useOnboardingPersistence } from './useOnboardingPersistence';
import { debugOnboarding } from '@/utils/onboardingDebug';
import { useOnboardingTelemetry } from './useOnboardingTelemetry';
import { useDataEnrichment } from './useDataEnrichment';
import { useInviteFlowTelemetry } from './useInviteFlowTelemetry';
import { usePostOnboardingSetup } from './usePostOnboardingSetup';

// Tipos limpos e corretos baseados na tabela onboarding_final
export interface OnboardingFinalData {
  id?: string;
  user_id: string;
  
  // JSONB Fields - estruturados conforme tabela onboarding_final
  personal_info: {
    name?: string;
    email?: string;
    phone?: string;
    instagram?: string;
    linkedin?: string;
    birth_date?: string;
    profile_picture?: string;
    curiosity?: string;
    state?: string;
    city?: string;
    country?: string;
    timezone?: string;
  };
  
  // Campos de compatibilidade com frontend antigo
  location_info?: {
    state?: string;
    city?: string;
    country?: string;
    timezone?: string;
  };
  
  business_info: {
    company_name?: string;
    position?: string;
    business_sector?: string;
    company_size?: string;
    annual_revenue?: string;
    company_website?: string;
  };
  
  ai_experience: {
    has_implemented_ai?: string;
    ai_tools_used?: string[];
    ai_knowledge_level?: string;
    who_will_implement?: string;
    ai_implementation_objective?: string;
    ai_implementation_urgency?: string;
    ai_main_challenge?: string;
  };
  
  goals_info: {
    main_objective?: string;
    area_to_impact?: string;
    expected_result_90_days?: string;
    urgency_level?: string;
    success_metric?: string;
    main_obstacle?: string;
    preferred_support?: string;
    ai_implementation_budget?: string;
  };
  
  preferences: {
    weekly_learning_time?: string;
    best_days?: string[];
    best_periods?: string[];
    content_preference?: string[];
    content_frequency?: string;
    wants_networking?: string;
    community_interaction_style?: string;
    preferred_communication_channel?: string;
    follow_up_type?: string;
    motivation_sharing?: string;
  };
  
  // Campo de compatibilidade para personalization
  personalization?: {
    weekly_learning_time?: string;
    best_days?: string[];
    best_periods?: string[];
    content_preference?: string[];
    content_frequency?: string;
    wants_networking?: string;
    community_interaction_style?: string;
    preferred_communication_channel?: string;
    follow_up_type?: string;
    motivation_sharing?: string;
  };
  
  // Campos diretos da tabela
  company_name?: string;
  annual_revenue?: string;
  ai_knowledge_level?: string;
  
  // Controle de etapas
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  completed_at?: string;
  
  // Analytics
  time_per_step?: Record<string, number>;
  completion_score?: number;
  abandonment_points?: any[];
  
  // Status
  status: 'in_progress' | 'completed' | 'abandoned';
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export const useCleanOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveToLocal, loadFromLocal, clearLocal, hasNewerLocalData } = useOnboardingPersistence(user?.id);
  const { logStepStarted, logStepCompleted, logValidationFailed, logOnboardingCompleted } = useOnboardingTelemetry();
  const { enrichProfileData, validateDataCompleteness } = useDataEnrichment();
  const { trackOnboardingCompleted, trackStepCompleted } = useInviteFlowTelemetry();
  const { setupUserAccess } = usePostOnboardingSetup();
  
  const [data, setData] = useState<OnboardingFinalData>({
    user_id: user?.id || '',
    personal_info: {},
    location_info: {}, // Compatibilidade
    business_info: {},
    ai_experience: {},
    goals_info: {},
    preferences: {},
    personalization: {}, // Compatibilidade
    current_step: 1,
    completed_steps: [],
    is_completed: false,
    status: 'in_progress'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataRestored, setDataRestored] = useState(false);

  // Carregar dados na inicialização APENAS uma vez
  useEffect(() => {
    if (user?.id && !isLoading) {
      loadData();
    }
  }, [user?.id]); // Remover loadData das dependências para evitar loops

  const loadData = useCallback(async () => {
    if (!user?.id) {
      console.warn('❌ [CLEAN-ONBOARDING] Usuário não identificado');
      return;
    }

    setIsLoading(true);
    console.log('🔍 [CLEAN-ONBOARDING] Carregando dados para usuário:', user.id);

    try {
      // 1. Tentar recuperar dados locais primeiro
      const localData = loadFromLocal();
      
      // 2. Buscar dados do servidor
      const { data: onboardingData, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        debugOnboarding.logError('loadData', error, { userId: user.id });
        
        // Se erro no servidor mas tem dados locais, usar os locais
        if (localData) {
          console.log('🔄 [CLEAN-ONBOARDING] Usando dados locais devido ao erro do servidor');
          setData(localData);
          setDataRestored(true);
          toast({
            title: "⚠️ Dados restaurados",
            description: "Suas informações foram recuperadas do cache local.",
          });
          return;
        }
        throw error;
      }

      if (onboardingData) {
        const serverData = {
          ...onboardingData,
          // Garantir estruturas JSONB válidas
          personal_info: onboardingData.personal_info || {},
          location_info: {
            state: onboardingData.personal_info?.state,
            city: onboardingData.personal_info?.city,
            country: onboardingData.personal_info?.country,
            timezone: onboardingData.personal_info?.timezone
          },
          business_info: onboardingData.business_info || {},
          ai_experience: onboardingData.ai_experience || {},
          goals_info: onboardingData.goals_info || {}, // Campo correto da tabela
          preferences: onboardingData.personalization || {}, // Campo correto da tabela
          personalization: onboardingData.personalization || {}, // Compatibilidade
          completed_steps: onboardingData.completed_steps || [],
          time_per_step: onboardingData.time_per_step || {},
          abandonment_points: onboardingData.abandonment_points || []
        };

        // 3. Verificar se dados locais são mais recentes
        if (localData && hasNewerLocalData(serverData)) {
          console.log('⚡ [CLEAN-ONBOARDING] Dados locais mais recentes, priorizando...');
          setData(localData);
          setDataRestored(true);
          
          toast({
            title: "📱 Dados locais recuperados",
            description: "Suas alterações mais recentes foram restauradas automaticamente.",
          });
        } else {
          console.log('✅ [CLEAN-ONBOARDING] Dados do servidor carregados');
          setData(serverData);
        }
      } else {
        // 4. Se não há dados no servidor, verificar se há locais
        if (localData) {
          console.log('🔄 [CLEAN-ONBOARDING] Usando dados locais - servidor vazio');
          setData(localData);
          setDataRestored(true);
          
          toast({
            title: "📱 Dados restaurados",
            description: "Suas informações preenchidas foram recuperadas.",
          });
        } else {
          console.log('📭 [CLEAN-ONBOARDING] Nenhum dado encontrado, inicializando...');
          await initializeOnboarding();
        }
      }
    } catch (error) {
      console.error('❌ [CLEAN-ONBOARDING] Erro ao carregar dados:', error);
      
      // Fallback para dados locais em caso de erro
      const localData = loadFromLocal();
      if (localData) {
        console.log('🆘 [CLEAN-ONBOARDING] Fallback para dados locais');
        setData(localData);
        setDataRestored(true);
        
        toast({
          title: "⚠️ Dados recuperados offline",
          description: "Suas informações foram recuperadas do cache local.",
          variant: "default",
        });
      } else {
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar seus dados. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadFromLocal, hasNewerLocalData]);

  const initializeOnboarding = useCallback(async (inviteData?: any) => {
    if (!user?.id) return;

    try {
      console.log('🚀 [CLEAN-ONBOARDING] Inicializando onboarding com dados do convite:', inviteData);
      
      // Buscar dados do convite automaticamente se não fornecidos
      let inviteDataToUse = inviteData;
      if (!inviteDataToUse) {
        const inviteToken = new URLSearchParams(window.location.search).get('invite') || 
                            sessionStorage.getItem('current_invite_token');
        if (inviteToken) {
          console.log('🎫 [CLEAN-ONBOARDING] Buscando dados do convite automaticamente:', inviteToken.substring(0, 6) + '***');
          
          const { data: inviteInfo, error: inviteError } = await supabase.rpc('validate_invite_token_safe', {
            p_token: inviteToken
          });
          
          if (!inviteError && inviteInfo?.valid) {
            inviteDataToUse = inviteInfo.invite;
            console.log('✅ [CLEAN-ONBOARDING] Dados do convite obtidos:', inviteDataToUse);
          }
        }
      }
      
      const { data: result, error } = await supabase.rpc('initialize_onboarding_for_user', {
        p_user_id: user.id,
        p_invite_data: inviteDataToUse || {}
      });

      if (error) {
        console.error('❌ [CLEAN-ONBOARDING] Erro ao inicializar:', error);
        throw error;
      }

      if (result?.success) {
        console.log('✅ [CLEAN-ONBOARDING] Inicializado com sucesso:', result);
        console.log('📋 [CLEAN-ONBOARDING] Dados pré-preenchidos:', result.personal_info_preloaded);
        
        // Recarregar dados após inicialização
        await loadData();
        
        if (result.invite_data_used) {
          toast({
            title: "Dados do convite carregados! ✨",
            description: "Suas informações foram pré-preenchidas automaticamente.",
          });
        }
      }
    } catch (error) {
      console.error('❌ [CLEAN-ONBOARDING] Erro na inicialização:', error);
    }
  }, [user?.id, loadData]);

  const updateData = useCallback((stepData: Partial<OnboardingFinalData>) => {
    setData(prev => {
      const newData = {
        ...prev,
        ...stepData,
        updated_at: new Date().toISOString()
      };
      
      // Salvar com debounce para evitar loops
      saveToLocal(newData);
      
      return newData;
    });
  }, [saveToLocal]);

  const saveAndNavigate = useCallback(async (stepData: any, currentStep: number, targetStep: number) => {
    console.log('💾 [CLEAN-ONBOARDING] Salvando e navegando...', { stepData, currentStep, targetStep });
    
    if (isSaving) {
      console.warn('⚠️ [CLEAN-ONBOARDING] Já está salvando, cancelando');
      return false;
    }

    setIsSaving(true);

    try {
      // Preparar dados atualizados
      const updatedData = { ...data };
      
      // Mapear dados por etapa específica
      switch (currentStep) {
        case 1:
          if (stepData.personal_info) {
            updatedData.personal_info = { ...updatedData.personal_info, ...stepData.personal_info };
          }
          if (stepData.location_info) {
            updatedData.personal_info = { 
              ...updatedData.personal_info, 
              state: stepData.location_info.state,
              city: stepData.location_info.city,
              country: stepData.location_info.country,
              timezone: stepData.location_info.timezone
            };
          }
          break;
        case 2:
          if (stepData.business_info) {
            updatedData.business_info = { ...updatedData.business_info, ...stepData.business_info };
            // Atualizar campos diretos também
            updatedData.company_name = stepData.business_info.companyName;
            updatedData.annual_revenue = stepData.business_info.annualRevenue;
          }
          break;
        case 3:
          if (stepData.ai_experience) {
            updatedData.ai_experience = { ...updatedData.ai_experience, ...stepData.ai_experience };
            // Atualizar campo direto
            updatedData.ai_knowledge_level = stepData.ai_experience.aiKnowledgeLevel;
          }
          break;
        case 4:
          if (stepData.goals_info) {
            updatedData.goals_info = { ...updatedData.goals_info, ...stepData.goals_info };
          }
          break;
        case 5:
          if (stepData.personalization) {
            updatedData.preferences = { ...updatedData.preferences, ...stepData.personalization };
            updatedData.personalization = { ...updatedData.personalization, ...stepData.personalization };
          }
          break;
      }

      // Atualizar controle de etapas
      const completedSteps = [...new Set([...updatedData.completed_steps, currentStep])];
      updatedData.completed_steps = completedSteps;
      updatedData.current_step = Math.max(targetStep, updatedData.current_step);
      
      // Se for etapa 6 ou targetStep = 7, marcar como completo
      if (targetStep > 6) {
        updatedData.is_completed = true;
        updatedData.completed_at = new Date().toISOString();
        updatedData.status = 'completed';
      }

      // Salvar no banco (usando campos corretos da tabela onboarding_final)
      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user!.id,
          personal_info: updatedData.personal_info,
          business_info: updatedData.business_info,
          ai_experience: updatedData.ai_experience,
          goals_info: updatedData.goals_info, // Campo correto da tabela
          personalization: updatedData.preferences, // Campo correto da tabela
          company_name: updatedData.company_name,
          annual_revenue: updatedData.annual_revenue,
          ai_knowledge_level: updatedData.ai_knowledge_level,
          current_step: updatedData.current_step,
          completed_steps: updatedData.completed_steps,
          is_completed: updatedData.is_completed,
          completed_at: updatedData.completed_at,
          time_per_step: updatedData.time_per_step || {},
          completion_score: updatedData.completion_score,
          abandonment_points: updatedData.abandonment_points || [],
          status: updatedData.status,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        debugOnboarding.logError('saveAndNavigate', error, { 
          stepData, 
          currentStep, 
          targetStep,
          updatedData: JSON.stringify(updatedData).slice(0, 500) + '...'
        });
        throw error;
      }

      console.log('✅ [CLEAN-ONBOARDING] Dados salvos com sucesso');
      setData(updatedData);
      
        // Registrar telemetria de step completado
        logStepCompleted(currentStep, stepData);
        trackStepCompleted(user!.id, currentStep, stepData);
        
        // Validar completude dos dados
        if (targetStep > 6) {
          const completeness = validateDataCompleteness(updatedData);
          console.log('📊 [CLEAN-ONBOARDING] Completude dos dados:', completeness);
          
          // Enriquecer dados do perfil
          await enrichProfileData(user!.id, updatedData);
        }
        
        // Salvar no localStorage após sucesso no servidor
        saveToLocal(updatedData);
      
      toast({
        title: "Dados salvos! ✅",
        description: `Etapa ${currentStep} concluída com sucesso.`,
      });
      
      // Navegar para próxima etapa
      if (targetStep <= 6) {
        navigate(`/onboarding/step/${targetStep}`);
      } else {
        // Onboarding concluído - completar via RPC para garantir consistência
        try {
          console.log('🏁 [CLEAN-ONBOARDING] Finalizando onboarding via RPC...');
          const { data: completeResult, error: completeError } = await supabase.rpc('complete_onboarding', {
            p_user_id: user!.id
          });
          
          if (completeError) {
            console.error('❌ [CLEAN-ONBOARDING] Erro ao finalizar:', completeError);
          } else {
            console.log('✅ [CLEAN-ONBOARDING] Onboarding finalizado via RPC:', completeResult);
            // Registrar telemetria de conclusão
            trackOnboardingCompleted(user!.id);
          }
        } catch (rpcError) {
          console.error('❌ [CLEAN-ONBOARDING] Falha no RPC de finalização:', rpcError);
        }
        
        // Limpar dados locais
        clearLocal();
        
        // Verificar acesso pós-onboarding
        await verifyPostOnboardingAccess();
        
        toast({
          title: "Onboarding concluído! 🎉",
          description: "Bem-vindo(a) à nossa plataforma!",
        });
        navigate('/dashboard');
      }
      
      return true;

    } catch (error) {
      console.error('❌ [CLEAN-ONBOARDING] Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, isSaving, user?.id, navigate, saveToLocal, clearLocal]);

  // Verificar acesso pós-onboarding
  const verifyPostOnboardingAccess = useCallback(async () => {
    try {
      console.log('🔐 [CLEAN-ONBOARDING] Verificando acesso pós-onboarding...');
      
      if (!user?.id) {
        console.warn('⚠️ [CLEAN-ONBOARDING] User ID não disponível');
        return;
      }
      
      // Usar o hook especializado para configurar acesso
      const result = await setupUserAccess(user.id);
      
      if (result.success) {
        console.log('✅ [CLEAN-ONBOARDING] Acesso configurado com sucesso');
        
        toast({
          title: "Acesso liberado! 🎉",
          description: "Você já pode usar todas as funcionalidades da plataforma.",
        });
      } else {
        console.warn('⚠️ [CLEAN-ONBOARDING] Problemas na configuração de acesso');
      }
      
    } catch (error) {
      console.error('❌ [CLEAN-ONBOARDING] Falha na verificação de acesso:', error);
    }
  }, [user?.id, setupUserAccess]);

  const canAccessStep = useCallback((step: number) => {
    console.log('🔐 [CLEAN-ONBOARDING] Verificando acesso ao step:', step, {
      is_completed: data.is_completed,
      current_step: data.current_step,
      completed_steps: data.completed_steps
    });

    // Se já está completo, não permitir acesso a steps específicos
    if (data.is_completed) {
      console.log('⛔ [CLEAN-ONBOARDING] Onboarding completo, negando acesso ao step:', step);
      return false;
    }
    
    // Se current_step é 7, significa que já passou por todas as etapas
    if (data.current_step === 7) {
      console.log('⛔ [CLEAN-ONBOARDING] Current step é 7, negando acesso ao step:', step);
      return false;
    }
    
    // CORREÇÃO DO LOOP: Permitir acesso ao step 1 sempre (início)
    // E permitir próximo step quando atual está completo
    if (step === 1) {
      console.log('✅ [CLEAN-ONBOARDING] Step 1 sempre permitido');
      return true;
    }
    
    // Para outros steps: verificar se step anterior foi completado
    const previousStepCompleted = data.completed_steps.includes(step - 1);
    const canAccess = previousStepCompleted || step <= data.current_step;
    
    console.log(`${canAccess ? '✅' : '❌'} [CLEAN-ONBOARDING] Acesso ao step ${step}:`, canAccess, {
      previousStepCompleted,
      currentStep: data.current_step
    });
    return canAccess;
  }, [data.is_completed, data.current_step, data.completed_steps]);

  // Removido auto-save periódico que causava loops

  return {
    data,
    isLoading,
    isSaving,
    currentStep: data.current_step,
    dataRestored,
    updateData,
    saveAndNavigate,
    canAccessStep,
    loadData,
    initializeOnboarding,
    reset: () => {} // Placeholder para compatibilidade
  };
};