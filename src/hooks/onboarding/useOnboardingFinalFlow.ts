
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData, CompleteOnboardingResponse } from '@/types/onboardingFinal';
import { validateBrazilianWhatsApp, validateLinkedInUrl, validateInstagramUrl, validateMinimumAge } from '@/utils/validationUtils';

export const useOnboardingFinalFlow = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const totalSteps = 8;

  // Estado inicial dos dados
  const [data, setData] = useState<OnboardingFinalData>({
    personal_info: {
      name: '',
      email: '',
      whatsapp: '',
      country_code: '+55',
      phone: '',
      birth_date: '',
      gender: '',
      timezone: ''
    },
    location_info: {
      country: '',
      state: '',
      city: '',
      instagram_url: '',
      linkedin_url: ''
    },
    discovery_info: {
      how_found_us: '',
      referred_by: ''
    },
    business_info: {
      company_name: '',
      role: '',
      company_size: '',
      company_sector: '',
      company_website: '',
      annual_revenue: '',
      current_position: ''
    },
    business_context: {
      business_model: '',
      business_challenges: [],
      short_term_goals: [],
      medium_term_goals: [],
      important_kpis: [],
      additional_context: ''
    },
    goals_info: {
      primary_goal: '',
      expected_outcomes: [],
      expected_outcome_30days: '',
      priority_solution_type: '',
      how_implement: '',
      week_availability: '',
      content_formats: []
    },
    ai_experience: {
      ai_knowledge_level: '',
      previous_tools: [],
      has_implemented: '',
      desired_ai_areas: [],
      completed_formation: false,
      is_member_for_month: false,
      nps_score: 0,
      improvement_suggestions: '',
      implemented_solutions: [],
      desired_solutions: [],
      previous_attempts: '',
      ai_tools: [],
      suggestions: ''
    },
    personalization: {
      interests: [],
      time_preference: [],
      available_days: [],
      networking_availability: '',
      skills_to_share: [],
      mentorship_topics: [],
      live_interest: '',
      authorize_case_usage: false,
      interested_in_interview: false,
      priority_topics: [],
      content_formats: []
    }
  });

  // Carregar dados existentes
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) return;

      try {
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
          console.log('📊 Dados existentes encontrados:', existingData);
          setData(existingData);
          setCurrentStep(existingData.current_step || 1);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  // Validação por step
  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Personal Info
        if (!data.personal_info.name?.trim()) {
          errors.name = 'Nome é obrigatório';
        }
        if (!data.personal_info.email?.trim()) {
          errors.email = 'Email é obrigatório';
        }
        if (data.personal_info.whatsapp && !validateBrazilianWhatsApp(data.personal_info.whatsapp)) {
          errors.whatsapp = 'WhatsApp deve ter formato válido (11) 99999-9999';
        }
        if (data.personal_info.birth_date && !validateMinimumAge(data.personal_info.birth_date, 18)) {
          errors.birth_date = 'Idade mínima de 18 anos';
        }
        break;

      case 2: // Location Info
        if (data.location_info.linkedin_url && !validateLinkedInUrl(data.location_info.linkedin_url)) {
          errors.linkedin_url = 'URL do LinkedIn inválida';
        }
        if (data.location_info.instagram_url && !validateInstagramUrl(data.location_info.instagram_url)) {
          errors.instagram_url = 'URL do Instagram inválida';
        }
        break;

      case 4: // Business Info
        if (!data.business_info.company_name?.trim()) {
          errors.company_name = 'Nome da empresa é obrigatório';
        }
        if (!data.business_info.role?.trim()) {
          errors.role = 'Cargo é obrigatório';
        }
        break;

      case 6: // Goals Info
        if (!data.goals_info.primary_goal?.trim()) {
          errors.primary_goal = 'Objetivo principal é obrigatório';
        }
        break;

      case 7: // AI Experience
        if (!data.ai_experience.ai_knowledge_level?.trim()) {
          errors.ai_knowledge_level = 'Nível de conhecimento em IA é obrigatório';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, data]);

  // Função para verificar se pode prosseguir
  const canProceed = useCallback(() => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  // Atualizar seção dos dados
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any> || {}),
        ...updates
      }
    }));
  }, []);

  // Próximo step
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, canProceed]);

  // Step anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<CompleteOnboardingResponse> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setIsSubmitting(true);
    
    try {
      console.log('🚀 Finalizando onboarding...');
      
      // Verificar se já existe um registro
      const { data: existingData } = await supabase
        .from('onboarding_final')
        .select('is_completed')
        .eq('user_id', user.id)
        .single();

      if (existingData?.is_completed) {
        console.log('✅ Onboarding já estava completo');
        return { success: true, wasAlreadyCompleted: true };
      }

      // Preparar dados para salvamento
      const finalData = {
        user_id: user.id,
        personal_info: data.personal_info as Record<string, any> || {},
        location_info: data.location_info as Record<string, any> || {},
        discovery_info: data.discovery_info as Record<string, any> || {},
        business_info: data.business_info as Record<string, any> || {},
        business_context: data.business_context as Record<string, any> || {},
        goals_info: data.goals_info as Record<string, any> || {},
        ai_experience: data.ai_experience as Record<string, any> || {},
        personalization: data.personalization as Record<string, any> || {},
        is_completed: true,
        current_step: totalSteps,
        completed_steps: Array.from({ length: totalSteps }, (_, i) => i + 1),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('💾 Salvando dados finais:', finalData);

      const { error: upsertError } = await supabase
        .from('onboarding_final')
        .upsert(finalData);

      if (upsertError) {
        console.error('❌ Erro ao salvar:', upsertError);
        throw upsertError;
      }

      console.log('✅ Onboarding finalizado com sucesso!');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, data, totalSteps]);

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
