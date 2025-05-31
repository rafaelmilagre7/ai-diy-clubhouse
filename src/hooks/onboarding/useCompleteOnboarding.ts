
import { useState, useEffect } from 'react';
import { OnboardingFinalData, OnboardingFinalState } from '@/types/onboardingFinal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

const STORAGE_KEY = 'onboarding_final_data';
const TOTAL_STEPS = 8;

// Estado inicial
const initialData: OnboardingFinalData = {
  personal_info: {
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55'
  },
  location_info: {
    country: '',
    state: '',
    city: ''
  },
  discovery_info: {
    how_found_us: ''
  },
  business_info: {
    company_name: '',
    role: '',
    company_size: '',
    company_sector: '',
    annual_revenue: ''
  },
  business_context: {
    business_model: '',
    business_challenges: []
  },
  goals_info: {
    primary_goal: '',
    expected_outcome_30days: ''
  },
  ai_experience: {
    ai_knowledge_level: '',
    has_implemented: ''
  },
  personalization: {
    interests: [],
    content_formats: []
  }
};

export const useCompleteOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingFinalData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(parsed.data || initialData);
        setCurrentStep(parsed.current_step || 1);
        setCompletedSteps(parsed.completed_steps || []);
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Salvar no localStorage sempre que os dados mudarem
  useEffect(() => {
    if (!isLoading) {
      const stateToSave = {
        data,
        current_step: currentStep,
        completed_steps: completedSteps,
        is_completed: false
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [data, currentStep, completedSteps, isLoading]);

  const updateSection = (section: keyof OnboardingFinalData, updates: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Validação para verificar se pode prosseguir
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.personal_info.name && data.personal_info.email && data.personal_info.whatsapp;
      case 2:
        return data.location_info.country && data.location_info.state && data.location_info.city;
      case 3:
        return data.discovery_info.how_found_us;
      case 4:
        return data.business_info.company_name && data.business_info.role && 
               data.business_info.company_size && data.business_info.company_sector && 
               data.business_info.annual_revenue;
      case 5:
        return data.business_context.business_model && data.business_context.business_challenges.length > 0;
      case 6:
        return data.goals_info.primary_goal && data.goals_info.expected_outcome_30days;
      case 7:
        return data.ai_experience.ai_knowledge_level && data.ai_experience.has_implemented;
      case 8:
        return true; // Última etapa é opcional
      default:
        return false;
    }
  };

  const completeOnboarding = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para o banco
      const onboardingData = {
        user_id: user.id,
        
        // Informações pessoais
        name: data.personal_info.name,
        email: data.personal_info.email,
        phone: data.personal_info.whatsapp,
        ddi: data.personal_info.country_code,
        
        // Localização
        country: data.location_info.country,
        state: data.location_info.state,
        city: data.location_info.city,
        instagram: data.location_info.instagram_url,
        linkedin: data.location_info.linkedin_url,
        
        // Como nos conheceu
        how_found_us: data.discovery_info.how_found_us,
        referred_by: data.discovery_info.referred_by,
        
        // Informações do negócio
        company_name: data.business_info.company_name,
        current_position: data.business_info.role,
        company_size: data.business_info.company_size,
        company_sector: data.business_info.company_sector,
        company_website: data.business_info.company_website,
        annual_revenue: data.business_info.annual_revenue,
        
        // Contexto do negócio
        business_model: data.business_context.business_model,
        business_challenges: data.business_context.business_challenges,
        short_term_goals: data.business_context.short_term_goals,
        medium_term_goals: data.business_context.medium_term_goals,
        important_kpis: data.business_context.important_kpis,
        additional_context: data.business_context.additional_context,
        
        // Objetivos
        primary_goal: data.goals_info.primary_goal,
        expected_outcomes: data.goals_info.expected_outcomes,
        expected_outcome_30days: data.goals_info.expected_outcome_30days,
        priority_solution_type: data.goals_info.priority_solution_type,
        how_implement: data.goals_info.how_implement,
        week_availability: data.goals_info.week_availability,
        content_formats: data.goals_info.content_formats,
        
        // Experiência com IA
        knowledge_level: data.ai_experience.ai_knowledge_level,
        previous_tools: data.ai_experience.previous_tools,
        has_implemented: data.ai_experience.has_implemented,
        desired_ai_areas: data.ai_experience.desired_ai_areas,
        completed_formation: data.ai_experience.completed_formation,
        is_member_for_month: data.ai_experience.is_member_for_month,
        nps_score: data.ai_experience.nps_score,
        improvement_suggestions: data.ai_experience.improvement_suggestions,
        
        // Personalização
        interests: data.personalization.interests,
        time_preference: data.personalization.time_preference,
        available_days: data.personalization.available_days,
        networking_availability: data.personalization.networking_availability,
        skills_to_share: data.personalization.skills_to_share,
        mentorship_topics: data.personalization.mentorship_topics,
        live_interest: data.personalization.live_interest,
        authorize_case_usage: data.personalization.authorize_case_usage,
        interested_in_interview: data.personalization.interested_in_interview,
        priority_topics: data.personalization.priority_topics,
        
        // Metadados
        is_completed: true,
        completed_steps: Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1),
        current_step: 'completed'
      };

      console.log('Enviando dados do onboarding:', onboardingData);

      const { error } = await supabase
        .from('onboarding')
        .upsert(onboardingData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao salvar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      // Limpar localStorage após sucesso
      localStorage.removeItem(STORAGE_KEY);
      
      toast.success('Onboarding finalizado com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    data,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(),
    currentStep,
    totalSteps: TOTAL_STEPS,
    completedSteps,
    isSubmitting,
    isLoading
  };
};
