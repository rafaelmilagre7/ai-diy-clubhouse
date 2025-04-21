
import { steps } from "../useStepDefinitions";
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildUpdateObject(
  stepId: string,
  data: Partial<OnboardingData>,
  progress: OnboardingProgress | null,
  currentStepIndex: number
) {
  if (!progress) return {};

  const updateObj: any = {};

  // Dados específicos das etapas
  if (stepId === "personal") {
    updateObj.personal_info = data.personal_info || {};
  } else if (stepId === "professional_data") {
    updateObj.professional_info = data.professional_info || {};
    // Compatibilidade: salvar também campos individuais
    if (data.professional_info) {
      updateObj.company_name = data.professional_info.company_name;
      updateObj.company_size = data.professional_info.company_size;
      updateObj.company_sector = data.professional_info.company_sector;
      updateObj.company_website = data.professional_info.company_website;
      updateObj.current_position = data.professional_info.current_position;
      updateObj.annual_revenue = data.professional_info.annual_revenue;
    }
  } else if (stepId === "business_context") {
    updateObj.business_context = data.business_context || {};
  } else if (stepId === "ai_exp") {
    updateObj.ai_experience = data.ai_experience || {};
  } else if (stepId === "business_goals") {
    updateObj.business_goals = data.business_goals || {};
  } else if (stepId === "experience_personalization") {
    updateObj.experience_personalization = data.experience_personalization || {};
  } else if (stepId === "complementary_info") {
    updateObj.complementary_info = data.complementary_info || {};
  } else {
    // Outras etapas (futuro)
    const sectionKey = steps.find(s => s.id === stepId)?.section as keyof OnboardingData;
    if (sectionKey && data[sectionKey]) {
      updateObj[sectionKey] = data[sectionKey];
    }
  }

  // Progresso: marcar etapa como concluída se ainda não estava
  if (!progress.completed_steps?.includes(stepId)) {
    updateObj.completed_steps = [...(progress.completed_steps || []), stepId];
  }

  // Atualiza current_step
  const nextStep = steps[Math.min(currentStepIndex + 1, steps.length - 1)].id;
  updateObj.current_step = nextStep;

  return updateObj;
}
