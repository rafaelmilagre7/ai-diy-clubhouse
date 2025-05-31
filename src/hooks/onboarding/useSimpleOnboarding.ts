
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useOnboardingProgress } from './useOnboardingProgress';
import { mapQuickToProgress, validateStepData } from '@/utils/onboarding/dataMappers';
import { toast } from 'sonner';

const TOTAL_STEPS = 8;

const getInitialData = (): QuickOnboardingData => ({
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
  business_challenges: [],
  short_term_goals: [],
  medium_term_goals: [],
  important_kpis: [],
  additional_context: '',
  primary_goal: '',
  expected_outcomes: [],
  expected_outcome_30days: '',
  priority_solution_type: '',
  how_implement: '',
  week_availability: '',
  content_formats: [],
  ai_knowledge_level: 'iniciante',
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
  live_interest: 0,
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: [],
  currentStep: 1
});

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(getInitialData);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const {
    saveProgress,
    isLoading,
    isSaving
  } = useOnboardingProgress();

  // Auto-save simples com debounce
  useEffect(() => {
    if (!user?.id || !data.name) return;

    const timeoutId = setTimeout(async () => {
      try {
        console.log('💾 Auto-salvando progresso...');
        const progressData = mapQuickToProgress(data);
        progressData.current_step = currentStep.toString();
        await saveProgress(progressData);
      } catch (error) {
        console.error('❌ Erro no auto-save:', error);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [data, currentStep, user?.id, saveProgress]);

  // Inicializar com email do usuário
  useEffect(() => {
    if (user?.email && !data.email) {
      setData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user?.email, data.email]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(async () => {
    if (currentStep < TOTAL_STEPS) {
      console.log(`➡️ Avançando para etapa ${currentStep + 1}`);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      console.log(`⬅️ Voltando para etapa ${currentStep - 1}`);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    setIsCompleting(true);
    try {
      console.log('🏁 Completando onboarding...');
      
      const progressData = mapQuickToProgress(data);
      progressData.is_completed = true;
      progressData.completed_at = new Date().toISOString();
      progressData.current_step = 'completed';
      
      const success = await saveProgress(progressData);
      if (success) {
        console.log('✅ Onboarding completado com sucesso');
        toast.success('Onboarding completado com sucesso! 🎉');
        return true;
      } else {
        console.error('❌ Falha ao completar onboarding');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [data, saveProgress]);

  // Validação de step
  const canProceed = useCallback((): boolean => {
    return validateStepData(currentStep, data);
  }, [currentStep, data]);

  return {
    data,
    currentStep,
    totalSteps: TOTAL_STEPS,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(),
    isSaving,
    isCompleting,
    isLoading: isLoading || false,
    error: null
  };
};
