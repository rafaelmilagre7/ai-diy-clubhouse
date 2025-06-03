
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';

interface OnboardingFlowState {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  isCompleted: boolean;
  isLoading: boolean;
  isSaving: boolean;
  hasErrors: boolean;
  lastSaveTime: Date | null;
}

interface OnboardingProgressRecord {
  id: string;
  user_id: string;
  current_step: string;
  completed_steps: string[];
  is_completed: boolean;
  personal_info: any;
  professional_info: any;
  business_context: any;
  business_goals: any;
  ai_experience: any;
  experience_personalization: any;
  complementary_info: any;
  formation_data: any;
  onboarding_type: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useUnifiedOnboardingFlow = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingFlowState>({
    currentStep: 1,
    totalSteps: 4,
    data: {
      personal_info: {},
      professional_info: {},
      business_context: {},
      business_goals: {},
      ai_experience: {},
      experience_personalization: {},
      complementary_info: {},
      formation_data: {},
      onboarding_type: 'club'
    },
    isCompleted: false,
    isLoading: true,
    isSaving: false,
    hasErrors: false,
    lastSaveTime: null
  });

  // Função para determinar o passo atual baseado nos dados
  const calculateCurrentStep = useCallback((data: OnboardingData, completedSteps: string[]) => {
    const steps = ['personal_info', 'professional_info', 'business_goals', 'ai_experience'];
    
    for (let i = 0; i < steps.length; i++) {
      if (!completedSteps.includes(steps[i])) {
        return i + 1;
      }
    }
    
    return steps.length; // Todos os passos completos
  }, []);

  // Função para carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      console.log('🔄 Carregando dados do onboarding...');

      const { data: existingData, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingData) {
        console.log('✅ Dados encontrados:', existingData);
        
        const currentStep = calculateCurrentStep(existingData, existingData.completed_steps || []);
        
        setState(prev => ({
          ...prev,
          currentStep,
          data: {
            personal_info: existingData.personal_info || {},
            professional_info: existingData.professional_info || {},
            business_context: existingData.business_context || {},
            business_goals: existingData.business_goals || {},
            ai_experience: existingData.ai_experience || {},
            experience_personalization: existingData.experience_personalization || {},
            complementary_info: existingData.complementary_info || {},
            formation_data: existingData.formation_data || {},
            onboarding_type: existingData.onboarding_type || 'club'
          },
          isCompleted: existingData.is_completed || false,
          isLoading: false,
          hasErrors: false
        }));
      } else {
        console.log('ℹ️ Nenhum dado encontrado, iniciando novo onboarding');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        hasErrors: true 
      }));
      toast.error('Erro ao carregar dados do onboarding');
    }
  }, [user?.id, calculateCurrentStep]);

  // Função para salvar dados (auto-save)
  const saveData = useCallback(async (stepData: Partial<OnboardingData>, stepName: string) => {
    if (!user?.id || state.isSaving) return false;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      console.log(`💾 Salvando dados do passo: ${stepName}`);

      const updatedData = {
        ...state.data,
        ...stepData
      };

      // Verificar se já existe um registro
      const { data: existingRecord } = await supabase
        .from('onboarding_progress')
        .select('id, completed_steps')
        .eq('user_id', user.id)
        .maybeSingle();

      const completedSteps = existingRecord?.completed_steps || [];
      if (!completedSteps.includes(stepName)) {
        completedSteps.push(stepName);
      }

      const recordData = {
        user_id: user.id,
        current_step: stepName,
        completed_steps: completedSteps,
        personal_info: updatedData.personal_info,
        professional_info: updatedData.professional_info,
        business_context: updatedData.business_context,
        business_goals: updatedData.business_goals,
        ai_experience: updatedData.ai_experience,
        experience_personalization: updatedData.experience_personalization,
        complementary_info: updatedData.complementary_info,
        formation_data: updatedData.formation_data,
        onboarding_type: updatedData.onboarding_type || 'club',
        is_completed: completedSteps.length >= 4, // 4 passos obrigatórios
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingRecord) {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .update(recordData)
          .eq('id', existingRecord.id)
          .select()
          .single();
        result = { data, error };
      } else {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .insert(recordData)
          .select()
          .single();
        result = { data, error };
      }

      if (result.error) {
        throw result.error;
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        data: updatedData,
        currentStep: calculateCurrentStep(updatedData, completedSteps),
        isCompleted: completedSteps.length >= 4,
        isSaving: false,
        lastSaveTime: new Date(),
        hasErrors: false
      }));

      console.log('✅ Dados salvos com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      setState(prev => ({ 
        ...prev, 
        isSaving: false, 
        hasErrors: true 
      }));
      toast.error('Erro ao salvar dados');
      return false;
    }
  }, [user?.id, state.data, state.isSaving, calculateCurrentStep]);

  // Função para atualizar campo específico
  const updateField = useCallback((stepName: string, fieldPath: string, value: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [stepName]: {
          ...prev.data[stepName as keyof OnboardingData],
          [fieldPath]: value
        }
      }
    }));
  }, []);

  // Função para avançar para próximo passo
  const nextStep = useCallback(async (stepData: Partial<OnboardingData>, stepName: string) => {
    const saved = await saveData(stepData, stepName);
    if (saved && state.currentStep < state.totalSteps) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    }
    return saved;
  }, [saveData, state.currentStep, state.totalSteps]);

  // Função para voltar passo
  const previousStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  }, [state.currentStep]);

  // Função para finalizar onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({ 
          is_completed: true,
          current_step: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isCompleted: true,
        isSaving: false,
        currentStep: state.totalSteps
      }));

      toast.success('Onboarding concluído com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      toast.error('Erro ao finalizar onboarding');
      return false;
    }
  }, [user?.id, state.totalSteps]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  return {
    // Estado
    ...state,
    
    // Ações
    updateField,
    saveData,
    nextStep,
    previousStep,
    completeOnboarding,
    loadExistingData,
    
    // Utilitários
    canProceed: (stepName: string) => {
      const stepData = state.data[stepName as keyof OnboardingData];
      return stepData && Object.keys(stepData).length > 0;
    },
    
    getStepProgress: () => {
      const completed = state.currentStep - 1;
      return (completed / state.totalSteps) * 100;
    }
  };
};
