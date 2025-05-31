import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { OnboardingFinalData, CompleteOnboardingResponse } from '@/types/onboardingFinal';
import { validateBrazilianWhatsApp, validateMinimumAge, cleanWhatsApp } from '@/utils/validationUtils';

export const useOnboardingFinalFlow = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingFinalData>({
    personal_info: {
      name: '',
      email: ''
    },
    location_info: {},
    discovery_info: {},
    business_info: {},
    business_context: {},
    goals_info: {},
    ai_experience: {},
    personalization: {}
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const totalSteps = 8;

  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('🔍 Carregando dados existentes do onboarding...');

      const { data: existingData, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar dados:', error);
        return;
      }

      if (existingData) {
        console.log('✅ Dados encontrados:', existingData);
        setData(existingData);
        setCurrentStep(existingData.current_step || 1);
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    }
  }, [user?.id]);

  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Personal Info
        if (!data.personal_info?.name?.trim()) {
          errors['personal_info.name'] = 'Nome é obrigatório';
        }
        if (!data.personal_info?.email?.trim()) {
          errors['personal_info.email'] = 'Email é obrigatório';
        }
        if (data.personal_info?.whatsapp && !validateBrazilianWhatsApp(data.personal_info.whatsapp)) {
          errors['personal_info.whatsapp'] = 'WhatsApp inválido';
        }
        if (data.personal_info?.birth_date && !validateMinimumAge(data.personal_info.birth_date, 18)) {
          errors['personal_info.birth_date'] = 'Idade mínima é 18 anos';
        }
        if (data.personal_info?.gender && !['masculino', 'feminino'].includes(data.personal_info.gender)) {
          errors['personal_info.gender'] = 'Gênero deve ser masculino ou feminino';
        }
        break;
      
      case 2: // Location Info
        // Validações opcionais para localização
        break;
      
      case 3: // Discovery Info
        if (!data.discovery_info?.how_found_us?.trim()) {
          errors['discovery_info.how_found_us'] = 'Como nos conheceu é obrigatório';
        }
        break;
      
      case 4: // Business Info
        if (!data.business_info?.company_name?.trim()) {
          errors['business_info.company_name'] = 'Nome da empresa é obrigatório';
        }
        if (!data.business_info?.role?.trim()) {
          errors['business_info.role'] = 'Cargo é obrigatório';
        }
        break;
      
      case 5: // Business Context
        if (!data.business_context?.business_model?.trim()) {
          errors['business_context.business_model'] = 'Modelo de negócio é obrigatório';
        }
        break;
      
      case 6: // Goals Info
        if (!data.goals_info?.primary_goal?.trim()) {
          errors['goals_info.primary_goal'] = 'Objetivo principal é obrigatório';
        }
        break;
      
      case 7: // AI Experience
        if (!data.ai_experience?.ai_knowledge_level?.trim()) {
          errors['ai_experience.ai_knowledge_level'] = 'Nível de conhecimento em IA é obrigatório';
        }
        if (!data.ai_experience?.has_implemented?.trim()) {
          errors['ai_experience.has_implemented'] = 'Experiência com implementação é obrigatória';
        }
        break;
      
      case 8: // Personalization
        // Validações opcionais para personalização
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, data]);

  const canProceed = useCallback(() => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    console.log('🔄 Atualizando seção:', section, 'com dados:', updates);
    
    setData(prevData => {
      const currentSectionData = prevData[section] || {};
      
      return {
        ...prevData,
        [section]: {
          ...currentSectionData,
          ...updates
        }
      };
    });

    // Limpar erros de validação da seção atualizada
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => {
        const errorKey = `${section}.${key}`;
        if (newErrors[errorKey]) {
          delete newErrors[errorKey];
        }
      });
      return newErrors;
    });
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, canProceed]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(async (): Promise<CompleteOnboardingResponse> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    if (!validateCurrentStep()) {
      return { success: false, error: 'Dados inválidos na etapa atual' };
    }

    try {
      setIsSubmitting(true);
      console.log('🚀 Finalizando onboarding...');

      const finalData = {
        ...data,
        user_id: user.id,
        is_completed: true,
        current_step: totalSteps,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('onboarding_final')
        .upsert(finalData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Onboarding finalizado com sucesso!');
      return { success: true, data: result };

    } catch (error: any) {
      console.error('❌ Erro inesperado:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, data, validateCurrentStep]);

  return {
    data,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    currentStep,
    totalSteps,
    isSubmitting,
    isLoading,
    validationErrors
  };
};
