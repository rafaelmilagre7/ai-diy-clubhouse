
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildPersonalInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Verificar se temos dados válidos
  if (data.personal_info) {
    console.log("Atualizando personal_info com dados:", data.personal_info);
    updateObj.personal_info = {
      ...progress?.personal_info || {},
      ...data.personal_info
    };
  }
  
  return updateObj;
}
