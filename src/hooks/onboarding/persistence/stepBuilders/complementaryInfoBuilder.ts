
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  const existingComplementaryInfo = progress?.complementary_info || {};
  if ((data as any).complementary_info) {
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      ...(data as any).complementary_info
    };
  } else if (typeof data === 'object' && data !== null) {
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      ...data
    };
  }
  return updateObj;
}
