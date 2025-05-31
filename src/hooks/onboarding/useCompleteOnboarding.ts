
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData, OnboardingFinalState } from '@/types/onboardingFinal';
import { toast } from 'sonner';

const STORAGE_KEY = 'onboarding_final_data';

const getInitialData = (): OnboardingFinalData => ({
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
    ai_knowledge_level: 'iniciante',
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
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: [],
    live_interest: 0,
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: []
  }
});

export const useCompleteOnboarding = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingFinalState>({
    ...getInitialData(),
    current_step: 1,
    completed_steps: [],
    is_completed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const totalSteps = 8;

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          setState(prevState => ({
            ...prevState,
            ...parsedData
          }));
        }
      } catch (error) {
        console.warn('Erro ao carregar dados do localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Salvar no localStorage sempre que os dados mudarem
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
      }
    }
  }, [state, isLoading]);

  // Atualizar seção específica
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    setState(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        ...updates
      }
    }));
  }, []);

  // Validar se pode prosseguir na etapa atual
  const canProceed = useCallback((step: number): boolean => {
    switch (step) {
      case 1: // Informações Pessoais
        const { name, email, whatsapp } = state.personal_info;
        return !!(name?.trim() && email?.trim() && whatsapp?.trim());
      
      case 2: // Localização
        const { country, state: userState, city } = state.location_info;
        return !!(country?.trim() && userState?.trim() && city?.trim());
      
      case 3: // Como nos conheceu
        const { how_found_us } = state.discovery_info;
        return !!(how_found_us?.trim());
      
      case 4: // Negócio
        const { company_name, role, company_size, company_sector, annual_revenue } = state.business_info;
        return !!(company_name?.trim() && role?.trim() && company_size && company_sector && annual_revenue);
      
      case 5: // Contexto do Negócio
        const { business_model, business_challenges } = state.business_context;
        return !!(business_model?.trim() && business_challenges?.length > 0);
      
      case 6: // Objetivos
        const { primary_goal, expected_outcome_30days } = state.goals_info;
        return !!(primary_goal?.trim() && expected_outcome_30days?.trim());
      
      case 7: // IA Experience
        const { ai_knowledge_level, has_implemented } = state.ai_experience;
        return !!(ai_knowledge_level && has_implemented?.trim());
      
      case 8: // Personalização
        const { available_days, content_formats } = state.personalization;
        return !!(available_days?.length > 0 && content_formats?.length > 0);
      
      default:
        return false;
    }
  }, [state]);

  // Avançar para próximo step
  const nextStep = useCallback(() => {
    if (!canProceed(state.current_step)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (state.current_step < totalSteps) {
      setState(prevState => ({
        ...prevState,
        current_step: prevState.current_step + 1,
        completed_steps: [...new Set([...prevState.completed_steps, prevState.current_step])]
      }));
    }
  }, [state.current_step, canProceed, totalSteps]);

  // Voltar para step anterior
  const previousStep = useCallback(() => {
    if (state.current_step > 1) {
      setState(prevState => ({
        ...prevState,
        current_step: prevState.current_step - 1
      }));
    }
  }, [state.current_step]);

  // Finalizar onboarding completo
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    if (!canProceed(8)) {
      toast.error('Por favor, complete todos os campos obrigatórios');
      return false;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🏁 Enviando dados completos do onboarding...', state);

      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          personal_info: state.personal_info,
          location_info: state.location_info,
          discovery_info: state.discovery_info,
          business_info: state.business_info,
          business_context: state.business_context,
          goals_info: state.goals_info,
          ai_experience: state.ai_experience,
          personalization: state.personalization,
          is_completed: true,
          current_step: 8,
          completed_steps: [1, 2, 3, 4, 5, 6, 7, 8],
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Erro ao salvar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      // Limpar localStorage após sucesso
      localStorage.removeItem(STORAGE_KEY);
      
      console.log('✅ Onboarding finalizado com sucesso!');
      toast.success('Onboarding completado com sucesso! 🎉');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast.error('Erro inesperado ao finalizar');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, state, canProceed]);

  return {
    data: state,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(state.current_step),
    currentStep: state.current_step,
    totalSteps,
    isSubmitting,
    isLoading
  };
};
