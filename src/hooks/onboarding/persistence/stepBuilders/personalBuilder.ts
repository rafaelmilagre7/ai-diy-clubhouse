
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildPersonalUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  return {
    personal_info: data.personal_info || {},
  };
}
