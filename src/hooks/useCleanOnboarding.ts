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
  
  // Campos adicionais do banco de dados
  discovery_info?: Record<string, any>;
  business_context?: Record<string, any>;
  
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

  // Carregar dados na inicialização - SIMPLIFICADO
  useEffect(() => {
    if (user?.id && !isLoading) {
      loadData();
    }
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    console.log('🔍 [CLEAN-ONBOARDING] Carregando dados para usuário:', user.id);

    try {
      // Buscar dados do servidor (única fonte de verdade)
      const { data: onboardingData, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ [CLEAN-ONBOARDING] Erro ao carregar:', error);
        throw error;
      }

      if (onboardingData) {
        // Dados encontrados - estruturar corretamente
        const serverData = {
          ...onboardingData,
          personal_info: onboardingData.personal_info || {},
          location_info: {
            state: onboardingData.personal_info?.state,
            city: onboardingData.personal_info?.city,
            country: onboardingData.personal_info?.country,
            timezone: onboardingData.personal_info?.timezone
          },
          business_info: onboardingData.business_info || {},
          ai_experience: onboardingData.ai_experience || {},
          goals_info: onboardingData.goals_info || {},
          preferences: onboardingData.personalization || {},
          personalization: onboardingData.personalization || {},
          completed_steps: onboardingData.completed_steps || [],
          time_per_step: onboardingData.time_per_step || {},
          abandonment_points: onboardingData.abandonment_points || []
        };

        console.log('✅ [CLEAN-ONBOARDING] Dados carregados do servidor');
        setData(serverData);
      } else {
        // Nenhum dado encontrado - inicializar
        console.log('📭 [CLEAN-ONBOARDING] Nenhum dado encontrado, inicializando...');
        await initializeOnboarding();
      }
    } catch (error) {
      console.error('❌ [CLEAN-ONBOARDING] Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const initializeOnboarding = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🚀 [CLEAN-ONBOARDING] Inicializando onboarding para usuário:', user.id);
      
      // 🎯 NOVO FLUXO SIMPLIFICADO: Dados já estão no perfil via trigger
      const { data: result, error } = await supabase.rpc('initialize_onboarding_for_user', {
        p_user_id: user.id,
        p_invite_token: null  // Dados já foram processados pelo trigger
      });

      if (error) {
        console.error('❌ [CLEAN-ONBOARDING] Erro ao inicializar:', error);
        throw error;
      }

      if (result?.success) {
        console.log('✅ [CLEAN-ONBOARDING] Inicializado com sucesso:', result);
        
        // Recarregar dados após inicialização
        await loadData();
        
        if (result.profile_used) {
          toast({
            title: "Dados pré-preenchidos! ✨",
            description: "Suas informações do convite foram carregadas automaticamente.",
          });
        } else if (result.user_name_used) {
          toast({
            title: "Bem-vindo! 👋",
            description: `Olá ${result.user_name_used}, vamos personalizar sua experiência.`,
          });
        }
      }
    } catch (error) {
      console.error('❌ [CLEAN-ONBOARDING] Erro na inicialização:', error);
    }
  }, [user?.id, loadData]);

  const updateData = useCallback((stepData: Partial<OnboardingFinalData>) => {
    // 🎯 CORREÇÃO: Prevenir atualizações durante operações de save
    if (isSaving) {
      console.log('⏸️ [CLEAN-ONBOARDING] Pulando updateData durante save operation');
      return;
    }
    
    console.log('🔄 [CLEAN-ONBOARDING] Atualizando dados localmente:', stepData);
    
    setData(prev => {
      // 🎯 CORREÇÃO: Merge inteligente preservando dados existentes
      const mergedData = {
        ...prev,
        ...stepData,
        // Preservar dados pessoais se não foram passados no stepData
        personal_info: {
          ...prev.personal_info,
          ...stepData.personal_info
        },
        // Preservar dados de localização
        location_info: {
          ...prev.location_info,
          ...stepData.location_info
        },
        // Preservar dados de negócio
        business_info: {
          ...prev.business_info,
          ...stepData.business_info
        },
        // Preservar dados de experiência IA
        ai_experience: {
          ...prev.ai_experience,
          ...stepData.ai_experience
        },
        // Preservar dados de objetivos
        goals_info: {
          ...prev.goals_info,
          ...stepData.goals_info
        },
        // Preservar preferências/personalização
        preferences: {
          ...prev.preferences,
          ...stepData.preferences,
          ...stepData.personalization // Compatibilidade
        },
        personalization: {
          ...prev.personalization,
          ...stepData.personalization,
          ...stepData.preferences // Compatibilidade
        },
        updated_at: new Date().toISOString()
      };
      
      // Salvar localmente apenas se não estiver em processo de save
      if (!isSaving) {
        saveToLocal(mergedData);
      }
      
      return mergedData;
    });
  }, [saveToLocal, isSaving]);

  const saveAndNavigate = useCallback(async (stepData: any, currentStep: number, targetStep: number) => {
    if (isSaving) {
      console.warn('⚠️ [CLEAN-ONBOARDING] Já está salvando, cancelando');
      return false;
    }

    setIsSaving(true);
    console.log('💾 [CLEAN-ONBOARDING] Salvando step:', currentStep, '-> step:', targetStep);
    console.log('📋 [CLEAN-ONBOARDING] Dados recebidos para salvar:', stepData);

    try {
      // 🎯 CORREÇÃO: Merge inteligente dos dados JSONB
      const mergedPersonalInfo = {
        ...data.personal_info,
        ...stepData.personal_info
      };
      
      const mergedLocationInfo = {
        ...data.location_info,
        ...stepData.location_info
      };
      
      const mergedBusinessInfo = {
        ...data.business_info,
        ...stepData.business_info
      };
      
      const mergedAiExperience = {
        ...data.ai_experience,
        ...stepData.ai_experience
      };
      
      const mergedGoalsInfo = {
        ...data.goals_info,
        ...stepData.goals_info
      };
      
      const mergedPersonalization = {
        ...data.personalization,
        ...stepData.personalization,
        ...stepData.preferences
      };

      // Preparar dados atualizados
      const updatedData = {
        ...data,
        ...stepData,
        personal_info: mergedPersonalInfo,
        location_info: mergedLocationInfo,
        business_info: mergedBusinessInfo,
        ai_experience: mergedAiExperience,
        goals_info: mergedGoalsInfo,
        personalization: mergedPersonalization,
        current_step: Math.max(targetStep, data.current_step),
        completed_steps: [...new Set([...data.completed_steps, currentStep])],
        updated_at: new Date().toISOString()
      };

      // Marcar como completo se for o último step
      if (targetStep > 6) {
        updatedData.is_completed = true;
        updatedData.completed_at = new Date().toISOString();
        updatedData.status = 'completed';
      }

      // 🎯 CORREÇÃO: Preparar dados para Supabase com campos JSONB corretos
      const cleanData = {
        user_id: user!.id,
        personal_info: mergedPersonalInfo,
        location_info: mergedLocationInfo,
        discovery_info: data.discovery_info || {},
        business_info: mergedBusinessInfo,
        business_context: data.business_context || {},
        goals_info: mergedGoalsInfo,
        ai_experience: mergedAiExperience,
        personalization: mergedPersonalization,
        current_step: updatedData.current_step,
        completed_steps: updatedData.completed_steps || [],
        is_completed: updatedData.is_completed || false,
        status: updatedData.status || 'in_progress',
        updated_at: new Date().toISOString()
      };

      console.log('🧹 [CLEAN-ONBOARDING] Dados limpos para Supabase:', cleanData);

      // Salvar no Supabase
      const { error } = await supabase
        .from('onboarding_final')
        .upsert(cleanData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ [CLEAN-ONBOARDING] Erro ao salvar no Supabase:', error);
        console.error('❌ [CLEAN-ONBOARDING] Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [CLEAN-ONBOARDING] Dados salvos no Supabase com sucesso');

      // 🎯 CORREÇÃO CRÍTICA: Recarregar dados do servidor após save
      // Garantir sincronização entre front-end e back-end
      try {
        console.log('🔄 [CLEAN-ONBOARDING] Recarregando dados do servidor para sincronização...');
        
        const { data: freshData, error: refetchError } = await supabase
          .from('onboarding_final')
          .select('*')
          .eq('user_id', user!.id)
          .single();

        if (refetchError) {
          console.error('❌ [CLEAN-ONBOARDING] Erro ao recarregar dados:', refetchError);
          // Fallback para dados locais se refetch falhar
          setData(updatedData);
        } else {
          // Estruturar dados recarregados
          const serverSyncedData = {
            ...freshData,
            personal_info: freshData.personal_info || {},
            location_info: {
              state: freshData.personal_info?.state,
              city: freshData.personal_info?.city,
              country: freshData.personal_info?.country,
              timezone: freshData.personal_info?.timezone
            },
            business_info: freshData.business_info || {},
            ai_experience: freshData.ai_experience || {},
            goals_info: freshData.goals_info || {},
            preferences: freshData.personalization || {},
            personalization: freshData.personalization || {},
            completed_steps: freshData.completed_steps || [],
            time_per_step: freshData.time_per_step || {},
            abandonment_points: freshData.abandonment_points || []
          };
          
          console.log('✅ [CLEAN-ONBOARDING] Estado sincronizado com servidor:', {
            current_step: serverSyncedData.current_step,
            completed_steps: serverSyncedData.completed_steps,
            is_completed: serverSyncedData.is_completed
          });
          
          setData(serverSyncedData);
        }
      } catch (syncError) {
        console.error('❌ [CLEAN-ONBOARDING] Erro na sincronização:', syncError);
        // Fallback para dados locais
        setData(updatedData);
      }

      // 🎯 AGUARDAR um frame para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: "Dados salvos! ✅",
        description: `Etapa ${currentStep} concluída com sucesso.`,
      });

      // Navegar APENAS após sincronização completa
      if (targetStep <= 6) {
        console.log('🧭 [CLEAN-ONBOARDING] Navegando para step:', targetStep);
        navigate(`/onboarding/step/${targetStep}`, { replace: true });
      } else {
        // Onboarding completo
        console.log('🎉 [CLEAN-ONBOARDING] Onboarding completado, navegando para dashboard');
        toast({
          title: "Onboarding concluído! 🎉",
          description: "Bem-vindo(a) à nossa plataforma!",
        });
        navigate('/dashboard');
      }
      
      return true;

    } catch (error: any) {
      console.error('❌ [CLEAN-ONBOARDING] Erro crítico ao salvar:', error);
      console.error('❌ [CLEAN-ONBOARDING] Stack trace:', error.stack);
      console.error('❌ [CLEAN-ONBOARDING] Dados que tentavam ser salvos:', {
        stepData,
        currentStep,
        targetStep,
        originalData: data
      });
      
      toast({
        title: "Erro ao salvar",
        description: `Houve um problema ao salvar seus dados (${error.message}). Tente novamente.`,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, user, navigate, isSaving]);

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

    // 🎯 CORREÇÃO CRÍTICA: Permitir acesso sempre durante o onboarding
    // Só bloquear se realmente completou todo o processo
    if (data.is_completed && data.current_step === 7) {
      console.log('⛔ [CLEAN-ONBOARDING] Onboarding completamente finalizado');
      return false;
    }
    
    // 🎯 NOVO: Permitir navegação livre entre steps durante onboarding
    // Usuário pode voltar e avançar conforme necessário
    if (step >= 1 && step <= 6) {
      console.log('✅ [CLEAN-ONBOARDING] Acesso permitido ao step:', step);
      return true;
    }
    
    console.log('❌ [CLEAN-ONBOARDING] Step fora do range válido:', step);
    return false;
  }, [data.is_completed, data.current_step]);

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