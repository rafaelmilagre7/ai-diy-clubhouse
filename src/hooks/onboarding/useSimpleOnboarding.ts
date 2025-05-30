
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useRealtimeValidation } from './useRealtimeValidation';
import { useManualSave } from './useManualSave';
import { useOnboardingProgress } from './useOnboardingProgress';
import { mapProgressToQuick } from '@/utils/onboarding/dataMappers';
import { toast } from 'sonner';

const INITIAL_DATA: QuickOnboardingData = {
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
  live_interest: 0,
  content_formats: [],
  ai_knowledge_level: '',
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
  networking_availability: 0,
  skills_to_share: [],
  mentorship_topics: [],
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: []
};

const TOTAL_STEPS = 8;

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const { canProceed } = useRealtimeValidation(data, currentStep);
  const { saveManually, isSaving, loadFromLocalStorage } = useManualSave();
  const { completeOnboarding: completeOnboardingProgress } = useOnboardingProgress();

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Carregando dados existentes do onboarding...');

        // Try to load from local backup first
        const backup = loadFromLocalStorage();
        if (backup) {
          console.log('📦 Dados recuperados do backup local');
          setData(backup.data);
          setCurrentStep(backup.step);
          setIsLoading(false);
          return;
        }

        // Set user email if available
        if (user.email && !data.email) {
          setData(prev => ({ ...prev, email: user.email || '' }));
        }

        console.log('✅ Dados inicializados');
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados salvos');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id, user?.email, loadFromLocalStorage]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    console.log(`📝 Atualizando campo: ${field} =`, value);
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = useCallback(async () => {
    if (!canProceed) {
      toast.error('Preencha todos os campos obrigatórios antes de continuar');
      return;
    }

    console.log(`➡️ Avançando da etapa ${currentStep} para ${currentStep + 1}`);
    
    // Save progress
    const saveSuccess = await saveManually(data, currentStep + 1);
    if (!saveSuccess) {
      console.warn('⚠️ Falha ao salvar, mas permitindo navegação');
    }

    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  }, [canProceed, currentStep, data, saveManually]);

  const previousStep = useCallback(() => {
    console.log(`⬅️ Voltando da etapa ${currentStep} para ${currentStep - 1}`);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, [currentStep]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!canProceed) {
      toast.error('Preencha todos os campos obrigatórios antes de finalizar');
      return false;
    }

    try {
      setIsCompleting(true);
      console.log('🎯 Finalizando onboarding...');

      // Final save
      const saveSuccess = await saveManually(data, TOTAL_STEPS);
      if (!saveSuccess) {
        throw new Error('Falha ao salvar dados finais');
      }

      // Mark as completed
      const completeSuccess = await completeOnboardingProgress();
      if (!completeSuccess) {
        throw new Error('Falha ao marcar como completo');
      }

      console.log('✅ Onboarding finalizado com sucesso');
      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [canProceed, data, saveManually, completeOnboardingProgress]);

  return {
    data,
    currentStep,
    totalSteps: TOTAL_STEPS,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    isSaving,
    isCompleting,
    isLoading
  };
};
