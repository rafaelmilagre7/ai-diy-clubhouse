
import { useState, useCallback } from 'react';
import { OnboardingFinalData } from '@/types/onboardingFinal';
import { useCompleteOnboarding } from './useCompleteOnboarding';

const TOTAL_STEPS = 8;

// Estado inicial dos dados
const initialData: OnboardingFinalData = {
  personal_info: {
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    birth_date: ''
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
    improvement_suggestions: ''
  },
  personalization: {
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: '0',
    skills_to_share: [],
    mentorship_topics: [],
    live_interest: '0',
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: [],
    content_formats: []
  }
};

export const useOnboardingFinalFlow = () => {
  const [data, setData] = useState<OnboardingFinalData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding, isSubmitting } = useCompleteOnboarding();

  // Atualizar seção específica dos dados
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    setData(prevData => ({
      ...prevData,
      [section]: updates
    }));
  }, []);

  // Navegar para próxima etapa
  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  // Navegar para etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Validar se pode prosseguir para próxima etapa
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1: // Personal Info
        return !!(
          data.personal_info.name &&
          data.personal_info.email &&
          data.personal_info.whatsapp
        );
      
      case 2: // Location Info
        return !!(
          data.location_info.country &&
          data.location_info.state &&
          data.location_info.city
        );
      
      case 3: // Discovery Info
        return !!data.discovery_info.how_found_us;
      
      case 4: // Business Info
        return !!(
          data.business_info.company_name &&
          data.business_info.role &&
          data.business_info.company_size &&
          data.business_info.company_sector &&
          data.business_info.annual_revenue
        );
      
      case 5: // Business Context
        return !!(
          data.business_context.business_model &&
          data.business_context.business_challenges?.length > 0
        );
      
      case 6: // Goals Info
        return !!(
          data.goals_info.primary_goal &&
          data.goals_info.expected_outcome_30days
        );
      
      case 7: // AI Experience
        return !!(
          data.ai_experience.ai_knowledge_level &&
          data.ai_experience.has_implemented
        );
      
      case 8: // Personalization
        return true; // Sem validações obrigatórias
      
      default:
        return false;
    }
  }, [currentStep, data]);

  // Finalizar onboarding
  const handleCompleteOnboarding = useCallback(async () => {
    const result = await completeOnboarding(data);
    return result; // ← Retorna o objeto completo, não apenas result.success
  }, [data, completeOnboarding]);

  return {
    data,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding: handleCompleteOnboarding,
    canProceed: canProceed(),
    currentStep,
    totalSteps: TOTAL_STEPS,
    isSubmitting,
    isLoading
  };
};
