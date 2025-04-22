
import { OnboardingFormData, OnboardingStep } from '@/types/onboarding';

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'personal',
    title: 'Dados Pessoais',
    description: 'Compartilhe suas informações de contato para melhorarmos sua experiência.',
    fields: ['name', 'email', 'phone', 'ddi', 'linkedin', 'instagram', 'country', 'state', 'city', 'timezone'],
    isCompleted: (data: OnboardingFormData) => {
      return !!data.name && !!data.email && !!data.phone;
    }
  },
  {
    id: 'professional',
    title: 'Dados Profissionais',
    description: 'Conte-nos sobre sua empresa para personalizarmos as soluções.',
    fields: ['company_name', 'company_size', 'company_sector', 'company_website', 'current_position', 'annual_revenue'],
    isCompleted: (data: OnboardingFormData) => {
      return !!data.company_name && !!data.company_size && !!data.company_sector && !!data.current_position;
    }
  },
  {
    id: 'business-context',
    title: 'Contexto do Negócio',
    description: 'Compartilhe o contexto do seu negócio para entendermos melhor seus desafios.',
    fields: ['business_model', 'business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis', 'additional_context'],
    isCompleted: (data: OnboardingFormData) => {
      return !!data.business_model && Array.isArray(data.business_challenges) && data.business_challenges.length > 0;
    }
  },
  {
    id: 'business-goals',
    title: 'Objetivos do Negócio',
    description: 'Quais são seus principais objetivos com o VIVER DE IA Club?',
    fields: ['primary_goal', 'expected_outcomes', 'expected_outcome_30days', 'timeline', 'priority_solution_type', 'how_implement', 'week_availability', 'live_interest', 'content_formats'],
    isCompleted: (data: OnboardingFormData) => {
      return !!data.primary_goal && !!data.expected_outcome_30days;
    }
  },
  {
    id: 'ai-experience',
    title: 'Experiência com IA',
    description: 'Conte-nos sobre sua experiência atual com Inteligência Artificial.',
    fields: ['knowledge_level', 'previous_tools', 'has_implemented', 'desired_ai_areas', 'completed_formation', 'is_member_for_month', 'nps_score', 'improvement_suggestions'],
    isCompleted: (data: OnboardingFormData) => {
      return !!data.knowledge_level && !!data.has_implemented;
    }
  },
  {
    id: 'personalization',
    title: 'Personalização da Experiência',
    description: 'Como podemos personalizar sua jornada no VIVER DE IA Club?',
    fields: ['interests', 'time_preference', 'available_days', 'networking_availability', 'skills_to_share', 'mentorship_topics'],
    isCompleted: (data: OnboardingFormData) => {
      return Array.isArray(data.interests) && data.interests.length > 0;
    }
  },
  {
    id: 'complementary',
    title: 'Informações Complementares',
    description: 'Para finalizarmos, algumas informações adicionais.',
    fields: ['how_found_us', 'referred_by', 'authorize_case_usage', 'interested_in_interview', 'priority_topics'],
    isCompleted: (data: OnboardingFormData) => {
      return !!data.how_found_us;
    }
  },
  {
    id: 'review',
    title: 'Revisão',
    description: 'Revise suas informações antes de finalizar o onboarding.',
    fields: [],
    isCompleted: () => true
  }
];

// Obter rota a partir do ID do passo
export const getStepRoute = (stepId: string): string => {
  switch (stepId) {
    case 'personal':
      return '/onboarding';
    default:
      return `/onboarding/${stepId}`;
  }
};

// Obter passo a partir da rota
export const getStepFromRoute = (route: string): string => {
  if (route === '/onboarding') return 'personal';
  
  const parts = route.split('/');
  return parts[parts.length - 1];
};
