
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData, OnboardingFinalState } from '@/types/onboardingFinal';
import { toast } from 'sonner';

const TOTAL_STEPS = 8;

// Validações por etapa
const validateStep = (step: number, data: OnboardingFinalData): boolean => {
  switch (step) {
    case 1: // Personal Info
      return !!(
        data.personal_info.name &&
        data.personal_info.email &&
        data.personal_info.whatsapp &&
        data.personal_info.country_code
      );
    
    case 2: // Location Info
      return !!(
        data.location_info.country &&
        data.location_info.state &&
        data.location_info.city
      );
    
    case 3: // Discovery Info
      const hasFoundUs = !!data.discovery_info.how_found_us;
      const needsReferrer = data.discovery_info.how_found_us === 'indicacao';
      const hasReferrer = !!data.discovery_info.referred_by;
      return hasFoundUs && (!needsReferrer || hasReferrer);
    
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
        data.business_context.business_challenges &&
        data.business_context.business_challenges.length > 0
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
      const hasFormats = data.personalization.content_formats && data.personalization.content_formats.length >= 2;
      const hasDays = data.personalization.available_days && data.personalization.available_days.length >= 2;
      const hasTime = data.personalization.time_preference && data.personalization.time_preference.length >= 1;
      const hasAuth = data.personalization.authorize_case_usage !== undefined;
      return !!(hasFormats && hasDays && hasTime && hasAuth);
    
    default:
      return false;
  }
};

export const useCompleteOnboarding = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingFinalState>({
    current_step: 1,
    completed_steps: [],
    is_completed: false,
    personal_info: {},
    location_info: {},
    discovery_info: {},
    business_info: {},
    business_context: {},
    goals_info: {},
    ai_experience: {},
    personalization: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar onboarding:', error);
        return;
      }

      if (data) {
        setState({
          current_step: data.current_step,
          completed_steps: data.completed_steps || [],
          is_completed: data.is_completed,
          personal_info: data.personal_info || {},
          location_info: data.location_info || {},
          discovery_info: data.discovery_info || {},
          business_info: data.business_info || {},
          business_context: data.business_context || {},
          goals_info: data.goals_info || {},
          ai_experience: data.ai_experience || {},
          personalization: data.personalization || {}
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Auto-save quando dados mudarem
  const autoSave = useCallback(async (newState: OnboardingFinalState) => {
    if (!user?.id || isSubmitting) return;

    try {
      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          current_step: newState.current_step,
          completed_steps: newState.completed_steps,
          is_completed: newState.is_completed,
          personal_info: newState.personal_info,
          location_info: newState.location_info,
          discovery_info: newState.discovery_info,
          business_info: newState.business_info,
          business_context: newState.business_context,
          goals_info: newState.goals_info,
          ai_experience: newState.ai_experience,
          personalization: newState.personalization
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro no auto-save:', error);
      }
    } catch (error) {
      console.error('Erro inesperado no auto-save:', error);
    }
  }, [user?.id, isSubmitting]);

  // Atualizar seção
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    setState(prev => {
      const newState = {
        ...prev,
        [section]: {
          ...prev[section],
          ...updates
        }
      };
      
      // Auto-save com debounce
      setTimeout(() => autoSave(newState), 1000);
      
      return newState;
    });
  }, [autoSave]);

  // Próxima etapa
  const nextStep = useCallback(() => {
    setState(prev => {
      const newCompletedSteps = [...prev.completed_steps];
      if (!newCompletedSteps.includes(prev.current_step)) {
        newCompletedSteps.push(prev.current_step);
      }

      const newState = {
        ...prev,
        current_step: Math.min(prev.current_step + 1, TOTAL_STEPS),
        completed_steps: newCompletedSteps
      };

      autoSave(newState);
      return newState;
    });
  }, [autoSave]);

  // Etapa anterior
  const previousStep = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        current_step: Math.max(prev.current_step - 1, 1)
      };

      autoSave(newState);
      return newState;
    });
  }, [autoSave]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('onboarding_final')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          completed_steps: Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao completar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      setState(prev => ({
        ...prev,
        is_completed: true,
        completed_steps: Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)
      }));

      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro inesperado ao completar onboarding:', error);
      toast.error('Erro inesperado');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id]);

  // Verificar se pode prosseguir
  const canProceed = validateStep(state.current_step, state);

  // Carregar dados na montagem
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  return {
    data: state,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    currentStep: state.current_step,
    totalSteps: TOTAL_STEPS,
    isSubmitting,
    isLoading
  };
};
