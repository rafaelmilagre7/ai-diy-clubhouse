
import { useMemo } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';

export const useOnboardingValidation = () => {
  const validateStep1 = useMemo(() => (data: QuickOnboardingData) => {
    const { personal_info } = data;
    return !!(
      personal_info?.name?.trim() &&
      personal_info?.email?.trim() &&
      personal_info?.whatsapp?.trim() &&
      personal_info?.country_code?.trim() &&
      personal_info?.how_found_us?.trim()
    );
  }, []);

  const validateStep2 = useMemo(() => (data: QuickOnboardingData) => {
    const { professional_info } = data;
    return !!(
      professional_info?.company_name?.trim() &&
      professional_info?.role?.trim() &&
      professional_info?.company_size?.trim() &&
      professional_info?.company_segment?.trim() &&
      professional_info?.annual_revenue_range?.trim() &&
      professional_info?.main_challenge?.trim()
    );
  }, []);

  const validateStep3 = useMemo(() => (data: QuickOnboardingData) => {
    const { ai_experience } = data;
    return !!(
      ai_experience?.ai_knowledge_level?.trim() &&
      ai_experience?.uses_ai?.trim() &&
      ai_experience?.main_goal?.trim() &&
      ai_experience?.has_implemented?.trim() &&
      Array.isArray(ai_experience?.desired_ai_areas) &&
      ai_experience.desired_ai_areas.length > 0
    );
  }, []);

  const validateAllSteps = useMemo(() => (data: QuickOnboardingData) => {
    return validateStep1(data) && validateStep2(data) && validateStep3(data);
  }, [validateStep1, validateStep2, validateStep3]);

  return {
    validateStep1,
    validateStep2,
    validateStep3,
    validateAllSteps
  };
};
