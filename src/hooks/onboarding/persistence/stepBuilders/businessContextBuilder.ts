
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  if (data.business_context) {
    const contextData = data.business_context;
    const existingBusinessData = progress?.business_data || {};
    updateObj.business_data = {
      ...existingBusinessData,
      ...contextData,
    };
    updateObj.business_context = {
      ...existingBusinessData,
      ...contextData,
    };
  } else if (typeof data === 'object' && data !== null) {
    const existingBusinessData = progress?.business_data || {};
    updateObj.business_data = {
      ...existingBusinessData,
      ...data,
    };
    updateObj.business_context = {
      ...existingBusinessData,
      ...data,
    };
  }
  return updateObj;
}
