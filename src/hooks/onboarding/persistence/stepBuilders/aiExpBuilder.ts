
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildAiExpUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  if (data.ai_experience) {
    const existingAiExperience = progress?.ai_experience || {};
    let aiData = { ...existingAiExperience, ...data.ai_experience };
    if (typeof aiData.desired_ai_areas === "string") {
      aiData.desired_ai_areas = [aiData.desired_ai_areas];
    }
    if (aiData.desired_ai_areas && !Array.isArray(aiData.desired_ai_areas)) {
      aiData.desired_ai_areas = [aiData.desired_ai_areas];
    }
    updateObj.ai_experience = aiData;
  } else if (typeof data === 'object' && data !== null) {
    const existingAiExperience = progress?.ai_experience || {};
    updateObj.ai_experience = {
      ...existingAiExperience,
      ...data
    };
  }
  return updateObj;
}
