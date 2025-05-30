
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    birth_date: '',
    country: '',
    state: '',
    city: '',
    timezone: '',
    instagram_url: '',
    linkedin_url: '',
    how_found_us: '',
    referred_by: '',
    company_name: '',
    role: '',
    company_size: '',
    company_segment: '',
    company_website: '',
    annual_revenue_range: '',
    current_position: '',
    business_model: '',
    main_challenge: '',
    business_challenges: [],
    short_term_goals: [],
    medium_term_goals: [],
    important_kpis: [],
    additional_context: '',
    main_goal: '',
    primary_goal: '',
    expected_outcomes: [],
    expected_outcome_30days: '',
    priority_solution_type: '',
    how_implement: '',
    week_availability: '',
    content_formats: [],
    ai_knowledge_level: '',
    uses_ai: '',
    previous_tools: [],
    has_implemented: '',
    desired_ai_areas: [],
    completed_formation: false,
    is_member_for_month: false,
    nps_score: 0,
    improvement_suggestions: '',
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: [],
    live_interest: 5,
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 8;

  // Carregar dados existentes
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const { data: existingData, error } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar dados:', error);
          return;
        }

        if (existingData) {
          setData(existingData);
          // Se já tem dados, determinar a próxima etapa baseado nos campos preenchidos
          if (existingData.is_completed) {
            setCurrentStep(9); // Vai para a experiência mágica
          } else {
            setCurrentStep(determineNextStep(existingData));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  // Determinar próxima etapa baseado nos dados
  const determineNextStep = (data: QuickOnboardingData): number => {
    if (!data.name || !data.email || !data.whatsapp) return 1;
    if (!data.country || !data.state || !data.city) return 2;
    if (!data.how_found_us) return 3;
    if (!data.company_name || !data.role || !data.company_size) return 4;
    if (!data.business_model || !data.main_challenge) return 5;
    if (!data.main_goal || !data.expected_outcome_30days) return 6;
    if (!data.ai_knowledge_level || !data.uses_ai) return 7;
    if (!data.interests || data.interests.length === 0) return 8;
    return 9; // Todas as etapas completas
  };

  // Validação para permitir avançar
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.how_found_us);
      case 2:
        return !!(data.country && data.state && data.city);
      case 3:
        return !!data.how_found_us;
      case 4:
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 5:
        return !!(data.business_model && data.main_challenge);
      case 6:
        return !!(data.main_goal && data.expected_outcome_30days && data.priority_solution_type && data.how_implement && data.week_availability);
      case 7:
        return !!(data.ai_knowledge_level && data.uses_ai);
      case 8:
        return !!(data.interests && data.interests.length > 0);
      default:
        return true;
    }
  }, [currentStep, data]);

  // Atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Salvar dados no banco
  const saveData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar dados:', error);
        toast.error('Erro ao salvar dados');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar:', error);
      toast.error('Erro inesperado ao salvar dados');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data]);

  // Próximo passo
  const nextStep = useCallback(async () => {
    const saved = await saveData();
    if (saved && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [saveData, currentStep, totalSteps]);

  // Passo anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      
      // Salvar dados finais marcando como completo
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...data,
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao finalizar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      // Ir para a experiência mágica
      setCurrentStep(9);
      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro inesperado ao finalizar:', error);
      toast.error('Erro inesperado ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data]);

  return {
    data,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(),
    totalSteps,
    isSaving,
    isCompleting,
    isLoading
  };
};
