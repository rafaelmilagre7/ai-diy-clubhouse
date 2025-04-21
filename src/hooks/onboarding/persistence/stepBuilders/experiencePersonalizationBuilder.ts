
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  const existingExperiencePersonalization = progress?.experience_personalization || {};
  if ((data as any).experience_personalization) {
    updateObj.experience_personalization = {
      ...existingExperiencePersonalization,
      ...(data as any).experience_personalization
    };
  } else if (typeof data === 'object' && data !== null) {
    updateObj.experience_personalization = {
      ...existingExperiencePersonalization,
      ...data
    };
  }
  return updateObj;
}
