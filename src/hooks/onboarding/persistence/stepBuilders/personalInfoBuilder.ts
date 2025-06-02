
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildPersonalInfoUpdate(data: Partial<OnboardingData>, progress: any) {
  const updateObj: any = {};
  if (data.personal_info) {
    updateObj.personal_info = {
      ...progress?.personal_info || {},
      ...data.personal_info
    };
  }
  return updateObj;
}
