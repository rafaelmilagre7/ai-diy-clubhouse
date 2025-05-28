
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
  const [isCompleting, setIsCompleting] = useState(false);
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
    if (!user || isCompleting) {
      console.log('⚠️ Usuário não autenticado ou já finalizando');
      return false;
    }

    console.log('🎯 Iniciando finalização do onboarding...');
    setIsCompleting(true);

    try {
      // Validar se todos os dados estão completos
      if (!isDataComplete()) {
        console.error('❌ Dados incompletos para finalizar onboarding');
        toast.error('Complete todas as etapas antes de finalizar');
        setIsCompleting(false);
        return false;
      }

      console.log('💾 Salvando dados finais do onboarding...');

      // Primeiro, salvar/atualizar os dados do quick_onboarding
      const savePayload = {
        user_id: user.id,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        country_code: data.country_code,
        birth_date: data.birth_date || null,
        instagram_url: data.instagram_url,
        linkedin_url: data.linkedin_url,
        how_found_us: data.how_found_us,
        referred_by: data.referred_by,
        company_name: data.company_name,
        role: data.role,
        company_size: data.company_size,
        company_segment: data.company_segment,
        company_website: data.company_website,
        annual_revenue_range: data.annual_revenue_range,
        main_challenge: data.main_challenge,
        ai_knowledge_level: data.ai_knowledge_level,
        uses_ai: data.uses_ai,
        main_goal: data.main_goal,
        current_step: 4,
        is_completed: true,
        updated_at: new Date().toISOString()
      };

      // Verificar se já existe um registro
      const { data: existing } = await supabase
        .from('quick_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existing) {
        result = await supabase
          .from('quick_onboarding')
          .update(savePayload)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('quick_onboarding')
          .insert([savePayload]);
      }

      if (result.error) {
        console.error('❌ Erro ao salvar dados finais:', result.error);
        throw result.error;
      }

      // Atualizar profile básico com dados principais
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          company_name: data.company_name,
          industry: data.company_segment,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.warn('⚠️ Erro ao atualizar profile (não crítico):', profileError);
      }

      // Atualizar o currentStep para 4 (tela de finalização)
      setCurrentStep(4);

      console.log('✅ Onboarding finalizado com sucesso!');
      toast.success('Onboarding concluído! Trilha de implementação e networking liberados!');
      
      setIsCompleting(false);
      return true;

    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      setIsCompleting(false);
      return false;
    }
  }, [user, data, isDataComplete, isCompleting]);

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
    isDataComplete: isDataComplete(),
    isCompleting
  };
};
