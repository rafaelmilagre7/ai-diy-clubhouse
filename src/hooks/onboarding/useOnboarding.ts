import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface OnboardingData {
  // Step 1: Informações Pessoais
  personal_info: {
    name: string;
    phone: string;
    state: string;
    city: string;
    birth_date?: string;
  };
  
  // Step 2: Contexto de Negócio
  business_info: {
    company_name: string;
    company_sector: string;
    company_size: string;
    annual_revenue: string;
    current_position: string;
    years_experience: string;
  };
  
  // Step 3: Experiência com IA
  ai_experience: {
    experience_level: string;
    tools_used: string[];
    satisfaction_level: string;
    biggest_challenge: string;
  };
  
  // Step 4: Objetivos
  goals_info: {
    primary_goal: string;
    specific_challenge: string;
    key_metrics: string;
    timeline: string;
    success_definition: string;
  };
  
  // Step 5: Personalização
  personalization: {
    study_hours: string;
    preferred_content: string[];
    learning_style: string;
    support_level: string;
    schedule_preference: string;
  };
}

interface OnboardingState {
  id?: string;
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  data: Partial<OnboardingData>;
  nina_message?: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    current_step: 1,
    completed_steps: [],
    is_completed: false,
    data: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados existentes do onboarding
  const loadOnboardingData = useCallback(async () => {
    if (!user?.id) {
      console.log('[ONBOARDING] Usuário não encontrado');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('[ONBOARDING] Carregando dados para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Mudança aqui: usar maybeSingle() em vez de single()

      if (error) {
        console.error('[ONBOARDING] Erro ao carregar:', error);
        return;
      }
      
      console.log('[ONBOARDING] Dados encontrados:', data);

      if (data) {
        console.log('[ONBOARDING] Setando estado com dados carregados');
        setState({
          id: data.id,
          current_step: data.current_step,
          completed_steps: data.completed_steps || [],
          is_completed: data.is_completed,
          nina_message: data.nina_message,
          data: {
            personal_info: data.personal_info || {},
            business_info: data.business_info || {},
            ai_experience: data.ai_experience || {},
            goals_info: data.goals_info || {},
            personalization: data.personalization || {},
          },
        });
      } else {
        console.log('[ONBOARDING] Nenhum dado encontrado - primeiro acesso');
        setState({
          id: null,
          current_step: 1,
          completed_steps: [],
          is_completed: false,
          nina_message: null,
          data: {},
        });
      }
    } catch (error) {
      console.error('[ONBOARDING] Erro crítico ao carregar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Salvar dados do step atual
  const saveStepData = useCallback(async (step: number, stepData: any) => {
    if (!user?.id) {
      console.error('[ONBOARDING] Usuário não autenticado, não é possível salvar');
      return false;
    }
    
    console.log('[ONBOARDING] Iniciando salvamento do step:', step);
    console.log('[ONBOARDING] Dados a salvar:', stepData);
    console.log('[ONBOARDING] ID do usuário:', user.id);
    
    try {
      setIsSaving(true);
      toast.loading('Salvando dados...', { id: 'onboarding-save' });
      
      const stepMapping = {
        1: 'personal_info',
        2: 'business_info', 
        3: 'ai_experience',
        4: 'goals_info',
        5: 'personalization',
      };
      
      const fieldName = stepMapping[step as keyof typeof stepMapping];
      const newCompletedSteps = [...state.completed_steps];
      if (!newCompletedSteps.includes(step)) {
        newCompletedSteps.push(step);
      }

      const updateData = {
        user_id: user.id,
        current_step: step,
        completed_steps: newCompletedSteps,
        [fieldName]: stepData,
      };

      console.log('[ONBOARDING] Dados preparados para salvamento:', updateData);
      
      if (state.id) {
        // Atualizar registro existente
        console.log('[ONBOARDING] Atualizando registro existente com ID:', state.id);
        const { error } = await supabase
          .from('onboarding_final')
          .update(updateData)
          .eq('id', state.id);

        if (error) {
          console.error('[ONBOARDING] Erro ao atualizar:', error);
          throw error;
        }
        console.log('[ONBOARDING] Registro atualizado com sucesso');
      } else {
        // Criar novo registro
        console.log('[ONBOARDING] Criando novo registro');
        const { data: newRecord, error } = await supabase
          .from('onboarding_final')
          .insert(updateData)
          .select()
          .single();

        if (error) {
          console.error('[ONBOARDING] Erro ao criar registro:', error);
          throw error;
        }
        
        console.log('[ONBOARDING] Novo registro criado:', newRecord);
        setState(prev => ({ ...prev, id: newRecord.id }));
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        current_step: step,
        completed_steps: newCompletedSteps,
        data: {
          ...prev.data,
          [fieldName]: stepData,
        },
      }));

      console.log('[ONBOARDING] Step', step, 'salvo com sucesso!');
      toast.success('Dados salvos com sucesso!', { id: 'onboarding-save' });
      return true;
    } catch (error) {
      console.error('Erro ao salvar step:', error);
      toast.error('Erro ao salvar dados: ' + (error?.message || 'Erro desconhecido'), { id: 'onboarding-save' });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, state.id, state.completed_steps]);

  // Navegar para próximo step
  const goToNextStep = useCallback(async (currentStepData?: any) => {
    if (currentStepData) {
      const success = await saveStepData(state.current_step, currentStepData);
      if (!success) return false;
    }

    if (state.current_step < 6) {
      setState(prev => ({ ...prev, current_step: prev.current_step + 1 }));
      return true;
    }
    
    return false;
  }, [state.current_step, saveStepData]);

  // Navegar para step anterior
  const goToPrevStep = useCallback(() => {
    if (state.current_step > 1) {
      setState(prev => ({ ...prev, current_step: prev.current_step - 1 }));
    }
  }, [state.current_step]);

  // Finalizar onboarding (gerar mensagem da NINA)
  const completeOnboarding = useCallback(async (finalStepData: any) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      // Salvar dados do step 5 primeiro
      await saveStepData(5, finalStepData);
      
      // Chamar Edge Function para gerar mensagem da NINA
      const { data: ninaData, error: ninaError } = await supabase.functions
        .invoke('generate-nina-message', {
          body: {
            user_id: user.id,
            onboarding_data: {
              ...state.data,
              personalization: finalStepData,
            },
          },
        });

      if (ninaError) {
        console.error('Erro ao gerar mensagem da NINA:', ninaError);
        // Continuar mesmo sem a mensagem da NINA
      }

      // Finalizar onboarding
      const { error } = await supabase.rpc('complete_onboarding_flow', {
        p_user_id: user.id,
      });

      if (error) throw error;

      // Atualizar estado
      setState(prev => ({
        ...prev,
        current_step: 6,
        is_completed: true,
        completed_steps: [1, 2, 3, 4, 5, 6],
        nina_message: ninaData?.message || 'Bem-vindo(a) à nossa plataforma!',
      }));

      toast.success('Onboarding concluído com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, state.data, saveStepData]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadOnboardingData();
  }, [loadOnboardingData]);

  return {
    // Estado
    ...state,
    isLoading,
    isSaving,
    
    // Ações
    saveStepData,
    goToNextStep,
    goToPrevStep,
    completeOnboarding,
    
    // Helpers
    isStepCompleted: (step: number) => state.completed_steps.includes(step),
    canGoToStep: (step: number) => step <= Math.max(...state.completed_steps, state.current_step),
    progressPercentage: Math.round((state.completed_steps.length / 6) * 100),
  };
};