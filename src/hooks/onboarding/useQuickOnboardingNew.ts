
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { OnboardingValidator } from '@/utils/onboardingValidation';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { useQuickOnboardingDataLoader } from './useQuickOnboardingDataLoader';

const TOTAL_STEPS = 4;

export const useQuickOnboardingNew = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  // Usar o novo hook de carregamento de dados
  const { 
    data, 
    setData, 
    isLoading: isLoadingData, 
    hasExistingData,
    loadError 
  } = useQuickOnboardingDataLoader();

  // Auto-save hook
  const { saveToSupabase } = useQuickOnboardingAutoSave(data);

  // Atualizar campo específico com validação
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Validação em tempo real
      const validation = currentStep === 1 
        ? OnboardingValidator.validateStep1(newData)
        : currentStep === 2
        ? OnboardingValidator.validateStep2(newData)
        : OnboardingValidator.validateStep3(newData);
      
      setValidationErrors(validation.errors);
      
      return newData;
    });
  }, [currentStep]);

  // Validar se pode prosseguir
  const canProceed = useCallback(() => {
    const validation = currentStep === 1 
      ? OnboardingValidator.validateStep1(data)
      : currentStep === 2
      ? OnboardingValidator.validateStep2(data)
      : OnboardingValidator.validateStep3(data);
    
    return validation.isValid;
  }, [currentStep, data]);

  // Próximo passo com validação aprimorada
  const nextStep = useCallback(() => {
    const validation = currentStep === 1 
      ? OnboardingValidator.validateStep1(data)
      : currentStep === 2
      ? OnboardingValidator.validateStep2(data)
      : OnboardingValidator.validateStep3(data);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Por favor, corrija os erros antes de prosseguir');
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      setValidationErrors({});
    }
  }, [currentStep, data]);

  // Passo anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setValidationErrors({});
    }
  }, [currentStep]);

  // Salvar dados no Supabase com validação final
  const saveOnboardingData = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    // Validação final de todos os dados
    const finalValidation = OnboardingValidator.validateAllSteps(data);
    if (!finalValidation.isValid) {
      setValidationErrors(finalValidation.errors);
      throw new Error('Dados inválidos para salvamento');
    }

    try {
      // Verificar se já existe um registro
      const { data: existingRecord } = await supabase
        .from('quick_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const onboardingData = {
        user_id: user.id,
        current_step: 4,
        is_completed: true,
        completed_at: new Date().toISOString(),
        ...data
      };

      if (existingRecord) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('quick_onboarding')
          .update(onboardingData)
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('quick_onboarding')
          .insert([onboardingData]);

        if (error) throw error;
      }

      // Também salvar no formato do onboarding antigo para compatibilidade
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          personal_info: {
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp,
            country_code: data.country_code,
            birth_date: data.birth_date,
            instagram_url: data.instagram_url,
            linkedin_url: data.linkedin_url,
            how_found_us: data.how_found_us,
            referred_by: data.referred_by
          },
          professional_info: {
            company_name: data.company_name,
            role: data.role,
            company_size: data.company_size,
            company_segment: data.company_segment,
            company_website: data.company_website,
            annual_revenue_range: data.annual_revenue_range,
            main_challenge: data.main_challenge
          },
          ai_experience: {
            knowledge_level: data.ai_knowledge_level,
            uses_ai: data.uses_ai,
            main_goal: data.main_goal
          },
          is_completed: true,
          completed_steps: ['personal_info', 'professional_info', 'ai_experience'],
          current_step: 'completed'
        });

      console.log('Dados do onboarding salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados do onboarding:', error);
      throw error;
    }
  }, [user?.id, data]);

  // Completar onboarding com redirecionamento automático
  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      await saveOnboardingData();
      
      toast.success('Onboarding concluído com sucesso!');
      
      // Redirecionar automaticamente após a animação
      setTimeout(() => {
        navigate('/onboarding-new/completed');
      }, 3000); // 3 segundos para ver a animação
      
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      if (error instanceof Error && error.message.includes('Dados inválidos')) {
        toast.error('Por favor, verifique todos os dados antes de finalizar.');
      } else {
        toast.error('Erro ao finalizar onboarding. Tente novamente.');
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [saveOnboardingData, navigate]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isSubmitting,
    completeOnboarding,
    validationErrors,
    clearErrors: () => setValidationErrors({}),
    // Novos campos para indicar estado de carregamento
    isLoadingData,
    hasExistingData,
    loadError
  };
};
