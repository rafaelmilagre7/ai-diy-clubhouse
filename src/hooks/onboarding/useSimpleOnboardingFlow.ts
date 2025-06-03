
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData } from '@/types/onboardingFinal';
import { toast } from 'sonner';

interface UseSimpleOnboardingFlowReturn {
  data: OnboardingFinalData;
  currentStep: number;
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  updateSection: (section: keyof OnboardingFinalData, value: any) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeOnboarding: () => Promise<boolean>;
  validateCurrentStep: () => boolean;
}

const initialData: OnboardingFinalData = {
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
};

export const useSimpleOnboardingFlow = (): UseSimpleOnboardingFlowReturn => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingFinalData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados existentes do onboarding
  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      const { data: existingData, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar dados do onboarding:', error);
        return;
      }

      if (existingData) {
        // Extrair apenas os campos necessários para OnboardingFinalData
        const loadedData: OnboardingFinalData = {
          personal_info: {
            name: existingData.name || '',
            email: existingData.email || user.email || ''
          },
          location_info: {
            country: existingData.country,
            state: existingData.state,
            city: existingData.city,
            instagram_url: existingData.instagram,
            linkedin_url: existingData.linkedin
          },
          discovery_info: {
            how_found_us: existingData.how_found_us,
            referred_by: existingData.referred_by
          },
          business_info: {
            company_name: existingData.company_name,
            role: existingData.current_position,
            company_size: existingData.company_size,
            company_sector: existingData.company_sector,
            company_website: existingData.company_website,
            annual_revenue: existingData.annual_revenue
          },
          business_context: {
            business_model: existingData.business_model,
            business_challenges: existingData.business_challenges,
            additional_context: existingData.additional_context
          },
          goals_info: {
            primary_goal: existingData.primary_goal,
            expected_outcome_30days: existingData.expected_outcome_30days
          },
          ai_experience: {
            ai_knowledge_level: existingData.knowledge_level,
            has_implemented: existingData.has_implemented
          },
          personalization: {
            interests: existingData.interests,
            time_preference: existingData.time_preference,
            available_days: existingData.available_days
          }
        };

        setData(loadedData);

        // Determinar o step atual baseado nos dados preenchidos
        let step = 1;
        if (loadedData.personal_info.name && loadedData.personal_info.email) step = 2;
        if (loadedData.business_info.company_name) step = 3;
        if (loadedData.business_context.business_model) step = 4;
        if (loadedData.ai_experience.ai_knowledge_level) step = 5;
        if (loadedData.goals_info.primary_goal) step = 6;
        if (loadedData.discovery_info.how_found_us && !existingData.is_completed) step = 6;

        setCurrentStep(step);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  // Auto-save dos dados
  const autoSave = useCallback(async (newData: OnboardingFinalData) => {
    if (!user?.id || isSaving) return;

    try {
      setIsSaving(true);
      
      // Mapear os dados para a estrutura da tabela onboarding
      const saveData = {
        user_id: user.id,
        name: newData.personal_info.name,
        email: newData.personal_info.email,
        country: newData.location_info.country,
        state: newData.location_info.state,
        city: newData.location_info.city,
        instagram: newData.location_info.instagram_url,
        linkedin: newData.location_info.linkedin_url,
        how_found_us: newData.discovery_info.how_found_us,
        referred_by: newData.discovery_info.referred_by,
        company_name: newData.business_info.company_name,
        current_position: newData.business_info.role,
        company_size: newData.business_info.company_size,
        company_sector: newData.business_info.company_sector,
        company_website: newData.business_info.company_website,
        annual_revenue: newData.business_info.annual_revenue,
        business_model: newData.business_context.business_model,
        business_challenges: newData.business_context.business_challenges,
        additional_context: newData.business_context.additional_context,
        primary_goal: newData.goals_info.primary_goal,
        expected_outcome_30days: newData.goals_info.expected_outcome_30days,
        knowledge_level: newData.ai_experience.ai_knowledge_level,
        has_implemented: newData.ai_experience.has_implemented,
        interests: newData.personalization.interests,
        time_preference: newData.personalization.time_preference,
        available_days: newData.personalization.available_days,
        current_step: `step_${currentStep}`,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding')
        .upsert(saveData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro no auto-save:', error);
      }
    } catch (error) {
      console.error('Erro no auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, currentStep, isSaving]);

  // Atualizar seção
  const updateSection = useCallback((section: keyof OnboardingFinalData, value: any) => {
    const newData = {
      ...data,
      [section]: value
    };
    setData(newData);
    
    // Auto-save com debounce
    setTimeout(() => {
      autoSave(newData);
    }, 1000);
  }, [data, autoSave]);

  // Validação por step
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.personal_info.name && data.personal_info.email);
      case 2:
        return !!(data.business_info.company_name && data.business_info.role);
      case 3:
        return !!(data.business_context.business_model);
      case 4:
        return !!(data.ai_experience.ai_knowledge_level && data.ai_experience.has_implemented);
      case 5:
        return !!(data.goals_info.primary_goal);
      case 6:
        return !!(data.discovery_info.how_found_us);
      default:
        return true;
    }
  }, [currentStep, data]);

  // Próximo step
  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validateCurrentStep]);

  // Step anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsSubmitting(true);
      
      // Mapear os dados finais
      const finalData = {
        user_id: user.id,
        name: data.personal_info.name,
        email: data.personal_info.email,
        country: data.location_info.country,
        state: data.location_info.state,
        city: data.location_info.city,
        instagram: data.location_info.instagram_url,
        linkedin: data.location_info.linkedin_url,
        how_found_us: data.discovery_info.how_found_us,
        referred_by: data.discovery_info.referred_by,
        company_name: data.business_info.company_name,
        current_position: data.business_info.role,
        company_size: data.business_info.company_size,
        company_sector: data.business_info.company_sector,
        company_website: data.business_info.company_website,
        annual_revenue: data.business_info.annual_revenue,
        business_model: data.business_context.business_model,
        business_challenges: data.business_context.business_challenges,
        additional_context: data.business_context.additional_context,
        primary_goal: data.goals_info.primary_goal,
        expected_outcome_30days: data.goals_info.expected_outcome_30days,
        knowledge_level: data.ai_experience.ai_knowledge_level,
        has_implemented: data.ai_experience.has_implemented,
        interests: data.personalization.interests,
        time_preference: data.personalization.time_preference,
        available_days: data.personalization.available_days,
        is_completed: true,
        current_step: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding')
        .upsert(finalData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao finalizar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      toast.success('Onboarding finalizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      toast.error('Erro inesperado ao finalizar onboarding');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, data]);

  return {
    data,
    currentStep,
    isLoading,
    isSaving,
    isSubmitting,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    validateCurrentStep
  };
};
