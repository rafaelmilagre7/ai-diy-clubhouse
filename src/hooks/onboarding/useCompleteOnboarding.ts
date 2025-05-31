
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingFinalData, OnboardingFinalState } from '@/types/onboardingFinal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useCompleteOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado inicial do onboarding
  const [state, setState] = useState<OnboardingFinalState>({
    current_step: 1,
    completed_steps: [],
    is_completed: false,
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
      networking_availability: 0,
      skills_to_share: [],
      mentorship_topics: [],
      live_interest: 0,
      authorize_case_usage: false,
      interested_in_interview: false,
      priority_topics: [],
      content_formats: []
    }
  });

  const totalSteps = 8;

  // Função para atualizar uma seção específica
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    setState(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  }, []);

  // Função para ir para o próximo step
  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      current_step: Math.min(prev.current_step + 1, totalSteps),
      completed_steps: [...new Set([...prev.completed_steps, prev.current_step])]
    }));
  }, [totalSteps]);

  // Função para voltar ao step anterior
  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      current_step: Math.max(prev.current_step - 1, 1)
    }));
  }, []);

  // Validação se pode prosseguir (retorna boolean)
  const canProceed = useCallback((): boolean => {
    const { current_step } = state;
    
    switch (current_step) {
      case 1: // Personal Info
        return !!(state.personal_info.name && state.personal_info.email && state.personal_info.whatsapp);
      case 2: // Location Info
        return !!(state.location_info.country && state.location_info.state && state.location_info.city);
      case 3: // Discovery Info
        return !!(state.discovery_info.how_found_us && 
                 (state.discovery_info.how_found_us !== 'indicacao' || state.discovery_info.referred_by));
      case 4: // Business Info
        return !!(state.business_info.company_name && state.business_info.role && 
                 state.business_info.company_size && state.business_info.company_sector && 
                 state.business_info.annual_revenue);
      case 5: // Business Context
        return !!(state.business_context.business_model && state.business_context.business_challenges.length > 0);
      case 6: // Goals Info
        return !!(state.goals_info.primary_goal && state.goals_info.expected_outcome_30days);
      case 7: // AI Experience
        return !!(state.ai_experience.ai_knowledge_level && state.ai_experience.has_implemented);
      case 8: // Personalization
        return !!(state.personalization.available_days && state.personalization.available_days.length > 0 &&
                 state.personalization.content_formats && state.personalization.content_formats.length > 0);
      default:
        return false;
    }
  }, [state]);

  // Função para completar o onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    setIsSubmitting(true);

    try {
      // Salvar no banco de dados
      const { error } = await supabase
        .from('onboarding')
        .upsert({
          user_id: user.id,
          name: state.personal_info.name,
          email: state.personal_info.email,
          phone: state.personal_info.whatsapp,
          ddi: state.personal_info.country_code,
          country: state.location_info.country,
          state: state.location_info.state,
          city: state.location_info.city,
          instagram: state.location_info.instagram_url,
          linkedin: state.location_info.linkedin_url,
          how_found_us: state.discovery_info.how_found_us,
          referred_by: state.discovery_info.referred_by,
          company_name: state.business_info.company_name,
          current_position: state.business_info.role,
          company_size: state.business_info.company_size,
          company_sector: state.business_info.company_sector,
          company_website: state.business_info.company_website,
          annual_revenue: state.business_info.annual_revenue,
          business_model: state.business_context.business_model,
          business_challenges: state.business_context.business_challenges,
          short_term_goals: state.business_context.short_term_goals,
          medium_term_goals: state.business_context.medium_term_goals,
          important_kpis: state.business_context.important_kpis,
          additional_context: state.business_context.additional_context,
          primary_goal: state.goals_info.primary_goal,
          expected_outcomes: state.goals_info.expected_outcomes,
          expected_outcome_30days: state.goals_info.expected_outcome_30days,
          priority_solution_type: state.goals_info.priority_solution_type,
          how_implement: state.goals_info.how_implement,
          week_availability: state.goals_info.week_availability,
          knowledge_level: state.ai_experience.ai_knowledge_level,
          previous_tools: state.ai_experience.previous_tools,
          has_implemented: state.ai_experience.has_implemented,
          desired_ai_areas: state.ai_experience.desired_ai_areas,
          completed_formation: state.ai_experience.completed_formation,
          is_member_for_month: state.ai_experience.is_member_for_month,
          nps_score: state.ai_experience.nps_score,
          improvement_suggestions: state.ai_experience.improvement_suggestions,
          interests: state.personalization.interests,
          time_preference: state.personalization.time_preference,
          available_days: state.personalization.available_days,
          networking_availability: state.personalization.networking_availability,
          skills_to_share: state.personalization.skills_to_share,
          mentorship_topics: state.personalization.mentorship_topics,
          live_interest: state.personalization.live_interest,
          authorize_case_usage: state.personalization.authorize_case_usage,
          interested_in_interview: state.personalization.interested_in_interview,
          priority_topics: state.personalization.priority_topics,
          content_formats: state.personalization.content_formats,
          is_completed: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      toast.success('Onboarding finalizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro inesperado ao finalizar onboarding');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, state]);

  return {
    data: state,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(), // Retorna o valor boolean
    currentStep: state.current_step,
    totalSteps,
    isSubmitting,
    isLoading
  };
};
