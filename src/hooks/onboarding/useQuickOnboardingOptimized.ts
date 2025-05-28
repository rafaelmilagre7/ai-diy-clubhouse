
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
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  main_challenge: '',
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
        const hasRequiredPersonalInfo = !!(data.name && data.email && data.whatsapp && data.how_found_us);
        const hasReferralIfNeeded = data.how_found_us !== 'indicacao' || !!data.referred_by;
        return hasRequiredPersonalInfo && hasReferralIfNeeded;
      case 2:
        return !!(data.company_name && data.role && data.company_size && 
                  data.company_segment && data.annual_revenue_range && data.main_challenge);
      case 3:
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      default:
        return false;
    }
  }, [currentStep, data]);

  const nextStep = useCallback(() => {
    if (canProceed()) {
      console.log(`🔄 Avançando da etapa ${currentStep} para ${currentStep + 1}`);
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep]);

  const previousStep = useCallback(() => {
    console.log(`🔄 Voltando da etapa ${currentStep} para ${currentStep - 1}`);
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, [currentStep]);

  const isDataComplete = useCallback(() => {
    // Validação simples e direta de todos os campos obrigatórios
    const step1Complete = !!(
      data.name && 
      data.email && 
      data.whatsapp && 
      data.how_found_us &&
      (data.how_found_us !== 'indicacao' || data.referred_by)
    );

    const step2Complete = !!(
      data.company_name && 
      data.role && 
      data.company_size && 
      data.company_segment && 
      data.annual_revenue_range && 
      data.main_challenge
    );

    const step3Complete = !!(
      data.ai_knowledge_level && 
      data.uses_ai && 
      data.main_goal
    );

    console.log('📊 Validação de dados:', {
      step1Complete,
      step2Complete,
      step3Complete,
      allComplete: step1Complete && step2Complete && step3Complete
    });

    return step1Complete && step2Complete && step3Complete;
  }, [data]);

  const completeOnboarding = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    console.log('🎯 Iniciando finalização do onboarding...');

    // Primeiro, garantir que estamos na etapa 4
    if (currentStep !== 4) {
      console.log(`⚠️ Ajustando currentStep de ${currentStep} para 4`);
      setCurrentStep(4);
    }

    // Validar se todos os dados estão completos
    if (!isDataComplete()) {
      console.error('❌ Dados incompletos para finalizar onboarding');
      toast.error('Complete todas as etapas antes de finalizar');
      return false;
    }

    try {
      console.log('💾 Finalizando onboarding com dados completos...');

      // Atualizar quick_onboarding como completo
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .update({ 
          is_completed: true,
          current_step: 4,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (quickError) {
        console.error('❌ Erro ao atualizar quick_onboarding:', quickError);
        throw quickError;
      }

      // Atualizar onboarding_progress (se existir)
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .update({ 
          is_completed: true,
          current_step: 'completed',
          completed_steps: ['personal_info', 'professional_info', 'ai_experience'],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Não falhar se onboarding_progress não existir
      if (progressError && progressError.code !== 'PGRST116') {
        console.warn('⚠️ Erro ao atualizar onboarding_progress (não crítico):', progressError);
      }

      console.log('✅ Onboarding finalizado com sucesso!');
      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return false;
    }
  }, [user, isDataComplete, currentStep]);

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
    isSaving,
    lastSaveTime,
    completeOnboarding,
    isDataComplete: isDataComplete()
  };
};
