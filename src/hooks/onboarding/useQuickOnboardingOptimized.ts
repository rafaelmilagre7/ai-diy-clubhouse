
import { useState, useCallback, useMemo, useRef } from 'react';
import { useQuickOnboardingDataLoader } from './useQuickOnboardingDataLoader';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { useOnboardingValidation } from './useOnboardingValidation';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const { data, setData, isLoading, hasExistingData, loadError } = useQuickOnboardingDataLoader();
  const { isSaving, lastSaveTime: autoSaveTime } = useQuickOnboardingAutoSave(data);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);
  
  const isInitializedRef = useRef(false);
  
  // Normalizar lastSaveTime para number | null
  const lastSaveTime = useMemo(() => {
    if (autoSaveTime === null || autoSaveTime === undefined) return null;
    if (typeof autoSaveTime === 'number') return autoSaveTime;
    if (typeof autoSaveTime === 'object' && autoSaveTime !== null && 'getTime' in autoSaveTime) {
      return (autoSaveTime as Date).getTime();
    }
    return null;
  }, [autoSaveTime]);

  const {
    validateStep1,
    validateStep2,
    validateStep3,
    validateAllSteps
  } = useOnboardingValidation();

  // Verificar validações das etapas
  const step1Valid = useMemo(() => validateStep1(data), [data, validateStep1]);
  const step2Valid = useMemo(() => validateStep2(data), [data, validateStep2]);
  const step3Valid = useMemo(() => validateStep3(data), [data, validateStep3]);
  const allStepsValid = useMemo(() => validateAllSteps(data), [data, validateAllSteps]);

  // Lógica sequencial - só pode estar numa etapa se as anteriores estiverem válidas
  const canAccessStep = useMemo(() => ({
    1: true, // Sempre pode acessar step 1
    2: step1Valid, // Só pode acessar step 2 se step 1 estiver válido
    3: step1Valid && step2Valid, // Só pode acessar step 3 se steps 1 e 2 estiverem válidos
    4: step1Valid && step2Valid && step3Valid // Só pode acessar step 4 se todos estiverem válidos
  }), [step1Valid, step2Valid, step3Valid]);

  // Verificar se pode prosseguir do step atual
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1: return step1Valid;
      case 2: return step2Valid;
      case 3: return step3Valid;
      case 4: return allStepsValid;
      default: return false;
    }
  }, [currentStep, step1Valid, step2Valid, step3Valid, allStepsValid]);

  const canFinalize = useMemo(() => allStepsValid, [allStepsValid]);

  // Função para atualizar campos específicos
  const updateField = useCallback((field: string, value: any) => {
    setData(prev => {
      const updatedData = { ...prev };
      
      // Campos da etapa 1 (personal_info)
      if (['name', 'email', 'whatsapp', 'country_code', 'birth_date', 'instagram_url', 'linkedin_url', 'how_found_us', 'referred_by'].includes(field)) {
        updatedData.personal_info = {
          ...updatedData.personal_info,
          [field]: value
        };
      }
      // Campos da etapa 2 (professional_info)  
      else if (['company_name', 'role', 'company_size', 'company_segment', 'company_website', 'annual_revenue_range', 'main_challenge'].includes(field)) {
        updatedData.professional_info = {
          ...updatedData.professional_info,
          [field]: value
        };
      }
      // Campos da etapa 3 (ai_experience)
      else if (['ai_knowledge_level', 'uses_ai', 'main_goal', 'desired_ai_areas', 'has_implemented', 'previous_tools'].includes(field)) {
        updatedData.ai_experience = {
          ...updatedData.ai_experience,
          [field]: value
        };
      }
      
      return updatedData;
    });
  }, [setData]);

  const nextStep = useCallback(() => {
    if (!canProceed) {
      toast.error('Complete todos os campos obrigatórios antes de continuar');
      return;
    }
    
    if (currentStep < 4) {
      const nextStepNumber = currentStep + 1;
      // Verificar se pode acessar o próximo step
      if (canAccessStep[nextStepNumber as keyof typeof canAccessStep]) {
        setCurrentStep(nextStepNumber);
      } else {
        toast.error('Complete as etapas anteriores antes de continuar');
      }
    }
  }, [canProceed, currentStep, canAccessStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= 4) {
      // Verificar se pode acessar o step
      if (canAccessStep[stepNumber as keyof typeof canAccessStep]) {
        setCurrentStep(stepNumber);
      } else {
        toast.error('Complete as etapas anteriores antes de acessar esta seção');
      }
    }
  }, [canAccessStep]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user || !canFinalize) {
      toast.error('Complete todos os campos obrigatórios antes de finalizar');
      return false;
    }
    
    setIsCompletingOnboarding(true);
    
    try {
      // Preparar dados estruturados
      const onboardingPayload = {
        user_id: user.id,
        name: data.personal_info.name,
        email: data.personal_info.email,
        whatsapp: data.personal_info.whatsapp,
        country_code: data.personal_info.country_code,
        birth_date: data.personal_info.birth_date || null,
        instagram_url: data.personal_info.instagram_url || null,
        linkedin_url: data.personal_info.linkedin_url || null,
        how_found_us: data.personal_info.how_found_us,
        referred_by: data.personal_info.referred_by || null,
        company_name: data.professional_info.company_name,
        role: data.professional_info.role,
        company_size: data.professional_info.company_size,
        company_segment: data.professional_info.company_segment,
        company_website: data.professional_info.company_website || null,
        annual_revenue_range: data.professional_info.annual_revenue_range,
        main_challenge: data.professional_info.main_challenge,
        ai_knowledge_level: data.ai_experience.ai_knowledge_level,
        uses_ai: data.ai_experience.uses_ai,
        main_goal: data.ai_experience.main_goal,
        desired_ai_areas: data.ai_experience.desired_ai_areas || [],
        has_implemented: data.ai_experience.has_implemented,
        previous_tools: data.ai_experience.previous_tools || [],
        is_completed: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert(onboardingPayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Erro ao finalizar onboarding:', error);
        setRetryCount(prev => prev + 1);
        return false;
      }

      setIsCompleted(true);
      setRetryCount(0);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      setRetryCount(prev => prev + 1);
      return false;
    } finally {
      setIsCompletingOnboarding(false);
    }
  }, [user, canFinalize, data]);

  return {
    // Dados e estado
    data,
    updateField,
    
    // Navegação
    currentStep,
    totalSteps: 4,
    nextStep,
    previousStep,
    goToStep,
    
    // Validações
    canProceed,
    canFinalize,
    canAccessStep,
    step1Valid,
    step2Valid,
    step3Valid,
    allStepsValid,
    
    // Estados de carregamento
    isLoading,
    hasExistingData,
    loadError,
    isSaving,
    lastSaveTime,
    
    // Finalização
    isCompleted,
    completeOnboarding,
    isCompletingOnboarding,
    retryCount
  };
};
