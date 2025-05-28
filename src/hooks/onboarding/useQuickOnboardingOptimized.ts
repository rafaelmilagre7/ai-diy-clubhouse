
import { useState, useCallback } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingDataLoader } from './useQuickOnboardingDataLoader';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

const initialData: QuickOnboardingData = {
  // Etapa 1: Informações Pessoais
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  instagram_url: '',
  linkedin_url: '',
  how_found_us: '',
  referred_by: '',

  // Etapa 2: Negócio
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  main_challenge: '',

  // Etapa 3: Experiência com IA
  ai_knowledge_level: '',
  uses_ai: '',
  main_goal: ''
};

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const { 
    data, 
    setData, 
    isLoading, 
    hasExistingData, 
    loadError 
  } = useQuickOnboardingDataLoader();

  // Passar currentStep para o auto-save
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data, currentStep);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setData]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        // Etapa 1: Validar campos obrigatórios incluindo indicação condicional
        const hasRequiredPersonalInfo = !!(data.name && data.email && data.whatsapp && data.how_found_us);
        const hasReferralIfNeeded = data.how_found_us !== 'indicacao' || !!data.referred_by;
        return hasRequiredPersonalInfo && hasReferralIfNeeded;
      case 2:
        // Etapa 2: Validar informações completas do negócio
        return !!(data.company_name && data.role && data.company_size && 
                  data.company_segment && data.annual_revenue_range && data.main_challenge);
      case 3:
        // Etapa 3: Validar experiência completa com IA
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      default:
        return false;
    }
  }, [currentStep, data]);

  const nextStep = useCallback(() => {
    if (canProceed()) {
      console.log(`🔄 Avançando para etapa ${currentStep + 1}`);
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep]);

  const previousStep = useCallback(() => {
    console.log(`🔄 Voltando para etapa ${currentStep - 1}`);
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, [currentStep]);

  // Validação completa independente do currentStep
  const isDataComplete = useCallback(() => {
    return !!(
      // Etapa 1
      data.name && data.email && data.whatsapp && data.how_found_us &&
      (data.how_found_us !== 'indicacao' || data.referred_by) &&
      // Etapa 2
      data.company_name && data.role && data.company_size && 
      data.company_segment && data.annual_revenue_range && data.main_challenge &&
      // Etapa 3
      data.ai_knowledge_level && data.uses_ai && data.main_goal
    );
  }, [data]);

  const completeOnboarding = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    // Validar se todos os dados estão completos
    if (!isDataComplete()) {
      console.error('❌ Dados incompletos para finalizar onboarding:', {
        step1: !!(data.name && data.email && data.whatsapp && data.how_found_us),
        step2: !!(data.company_name && data.role && data.company_size && data.company_segment && data.annual_revenue_range && data.main_challenge),
        step3: !!(data.ai_knowledge_level && data.uses_ai && data.main_goal),
        data
      });
      toast.error('Complete todas as etapas antes de finalizar');
      return false;
    }

    try {
      console.log('🎯 Finalizando onboarding com dados completos');

      // Marcar como completo na tabela quick_onboarding
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .update({ 
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (quickError) {
        console.error('❌ Erro ao atualizar quick_onboarding:', quickError);
        throw quickError;
      }

      // Marcar como completo na tabela onboarding_progress também
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .update({ 
          is_completed: true,
          current_step: 'completed',
          completed_steps: ['personal_info', 'professional_info', 'ai_experience'],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (progressError) {
        console.error('❌ Erro ao atualizar onboarding_progress:', progressError);
        throw progressError;
      }

      console.log('✅ Onboarding finalizado com sucesso!');
      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return false;
    }
  }, [user, isDataComplete, data]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isLoading,
    hasExistingData,
    loadError,
    totalSteps: 4,
    // Adicionar estado de salvamento
    isSaving,
    lastSaveTime,
    completeOnboarding,
    // Expor função de validação completa para debug
    isDataComplete: isDataComplete()
  };
};
