import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData, CompleteOnboardingResponse } from '@/types/onboardingFinal';
import { validateBrazilianWhatsApp, validateMinimumAge, cleanWhatsApp } from '@/utils/validationUtils';

export const useOnboardingFinalFlow = () => {
  const { user } = useAuth();
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

  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const totalSteps = 8;

  const loadExistingData = useCallback(async () => {
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
        console.log('✅ Dados existentes encontrados:', existingData);
        setData(existingData);
        setCurrentStep(existingData.current_step || 1);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

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
          errors.whatsapp = 'WhatsApp deve ser um número brasileiro válido (11 dígitos)';
        }
        if (data.personal_info.birth_date && !validateMinimumAge(data.personal_info.birth_date, 18)) {
          errors.birth_date = 'Você deve ter pelo menos 18 anos';
        }
        // Corrigir validação do gênero - verificar se é uma das opções válidas
        if (data.personal_info.gender && !['masculino', 'feminino'].includes(data.personal_info.gender)) {
          errors.gender = 'Selecione uma opção válida';
        }
        break;
        
      case 2: // Location Info
        if (!data.location_info.country?.trim()) {
          errors.country = 'País é obrigatório';
        }
        if (!data.location_info.state?.trim()) {
          errors.state = 'Estado é obrigatório';
        }
        if (!data.location_info.city?.trim()) {
          errors.city = 'Cidade é obrigatória';
        }
        break;
        
      case 3: // Discovery Info
        if (!data.discovery_info.how_found_us?.trim()) {
          errors.how_found_us = 'Campo obrigatório';
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
        
      case 5: // Business Context
        if (!data.business_context.business_model?.trim()) {
          errors.business_model = 'Modelo de negócio é obrigatório';
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
        
      case 8: // Personalization
        if (!data.personalization.interests || data.personalization.interests.length === 0) {
          errors.interests = 'Selecione pelo menos um interesse';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, data]);

  const canProceed = useCallback(() => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    console.log(`🔄 Atualizando seção ${section}:`, updates);
    
    // Aplicar limpeza e formatação específica para dados pessoais
    if (section === 'personal_info' && updates.whatsapp) {
      updates.whatsapp = cleanWhatsApp(updates.whatsapp);
    }
    
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  }, []);

  const nextStep = useCallback(() => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, validateCurrentStep]);

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
      return { success: false, error: 'Dados inválidos. Verifique os campos.' };
    }

    try {
      setIsSubmitting(true);
      console.log('🚀 Finalizando onboarding...');

      // Preparar dados finais com limpeza
      const finalData = {
        ...data,
        personal_info: {
          ...data.personal_info,
          whatsapp: data.personal_info.whatsapp ? cleanWhatsApp(data.personal_info.whatsapp) : undefined
        },
        is_completed: true,
        completed_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase.rpc('save_onboarding_final', {
        p_user_id: user.id,
        p_data: finalData
      });

      if (error) {
        console.error('❌ Erro ao salvar onboarding:', error);
        throw error;
      }

      console.log('✅ Onboarding finalizado com sucesso:', result);
      return { success: true, data: result };

    } catch (error: any) {
      console.error('❌ Erro ao completar onboarding:', error);
      return { 
        success: false, 
        error: error.message || 'Erro desconhecido ao finalizar onboarding' 
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, data, validateCurrentStep]);

  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  return {
    data,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(),
    currentStep,
    totalSteps,
    isSubmitting,
    isLoading,
    validationErrors
  };
};
