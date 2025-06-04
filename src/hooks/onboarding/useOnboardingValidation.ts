
import { useCallback } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useOnboardingValidation = () => {
  const { user } = useAuth();

  const validateStep1 = useCallback((data: QuickOnboardingData): boolean => {
    const hasRequiredPersonalInfo = !!(data.name && data.email && data.whatsapp && data.how_found_us);
    const hasReferralIfNeeded = data.how_found_us !== 'indicacao' || !!data.referred_by;
    return hasRequiredPersonalInfo && hasReferralIfNeeded;
  }, []);

  const validateStep2 = useCallback((data: QuickOnboardingData): boolean => {
    return !!(data.company_name && data.role && data.company_size && 
              data.company_segment && data.annual_revenue_range && data.main_challenge);
  }, []);

  const validateStep3 = useCallback((data: QuickOnboardingData): boolean => {
    return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
  }, []);

  const validateAllSteps = useCallback((data: QuickOnboardingData): boolean => {
    return validateStep1(data) && validateStep2(data) && validateStep3(data);
  }, [validateStep1, validateStep2, validateStep3]);

  const validateDataInDatabase = useCallback(async (): Promise<{
    isValid: boolean;
    missingFields: string[];
    hasQuickOnboarding: boolean;
    hasOnboardingProgress: boolean;
  }> => {
    if (!user) {
      return {
        isValid: false,
        missingFields: ['user_not_authenticated'],
        hasQuickOnboarding: false,
        hasOnboardingProgress: false
      };
    }

    try {
      // Verificar quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Verificar onboarding_progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const hasQuickOnboarding = !quickError && !!quickData;
      const hasOnboardingProgress = !progressError && !!progressData;

      if (!hasQuickOnboarding) {
        return {
          isValid: false,
          missingFields: ['quick_onboarding_missing'],
          hasQuickOnboarding: false,
          hasOnboardingProgress
        };
      }

      // Verificar campos obrigatórios
      const missingFields: string[] = [];
      
      // Etapa 1
      if (!quickData.name) missingFields.push('name');
      if (!quickData.email) missingFields.push('email');
      if (!quickData.whatsapp) missingFields.push('whatsapp');
      if (!quickData.how_found_us) missingFields.push('how_found_us');
      if (quickData.how_found_us === 'indicacao' && !quickData.referred_by) {
        missingFields.push('referred_by');
      }

      // Etapa 2
      if (!quickData.company_name) missingFields.push('company_name');
      if (!quickData.role) missingFields.push('role');
      if (!quickData.company_size) missingFields.push('company_size');
      if (!quickData.company_segment) missingFields.push('company_segment');
      if (!quickData.annual_revenue_range) missingFields.push('annual_revenue_range');
      if (!quickData.main_challenge) missingFields.push('main_challenge');

      // Etapa 3
      if (!quickData.ai_knowledge_level) missingFields.push('ai_knowledge_level');
      if (!quickData.uses_ai) missingFields.push('uses_ai');
      if (!quickData.main_goal) missingFields.push('main_goal');

      const isValid = missingFields.length === 0;

      return {
        isValid,
        missingFields,
        hasQuickOnboarding,
        hasOnboardingProgress
      };
    } catch (error) {
      console.error('❌ Erro ao validar dados no banco:', error);
      return {
        isValid: false,
        missingFields: ['database_error'],
        hasQuickOnboarding: false,
        hasOnboardingProgress: false
      };
    }
  }, [user]);

  return {
    validateStep1,
    validateStep2,
    validateStep3,
    validateAllSteps,
    validateDataInDatabase
  };
};
