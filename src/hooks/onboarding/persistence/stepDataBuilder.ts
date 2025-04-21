
import { steps } from "../useStepDefinitions";
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { buildPersonalUpdate } from "./stepBuilders/personalBuilder";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";
import { buildBusinessContextUpdate } from "./stepBuilders/businessContextBuilder";
import { buildAiExpUpdate } from "./stepBuilders/aiExpBuilder";
import { buildBusinessGoalsUpdate } from "./stepBuilders/businessGoalsBuilder";
import { buildExperiencePersonalizationUpdate } from "./stepBuilders/experiencePersonalizationBuilder";
import { buildComplementaryInfoUpdate } from "./stepBuilders/complementaryInfoBuilder";
import { buildGoalsUpdate } from "./stepBuilders/goalsBuilder";

// Função principal modularizada
export function buildUpdateObject(
  stepId: string,
  data: Partial<OnboardingData> | ProfessionalDataInput,
  progress: OnboardingProgress | null,
  currentStepIndex: number
) {
  if (!progress) return {};

  const updateObj: any = {};
  console.log(`Construindo objeto de atualização para o passo ${stepId} com dados:`, data);

  // Usar funções específicas para cada tipo de etapa
  switch (stepId) {
    case "personal":
      Object.assign(updateObj, buildPersonalUpdate(data as Partial<OnboardingData>, progress));
      break;
    case "professional_data":
      // Use a função específica para este tipo de dados
      Object.assign(updateObj, buildProfessionalDataUpdate(data as ProfessionalDataInput, progress));
      break;
    case "business_context":
      Object.assign(updateObj, buildBusinessContextUpdate(data as Partial<OnboardingData>, progress));
      break;
    case "ai_exp":
      Object.assign(updateObj, buildAiExpUpdate(data as Partial<OnboardingData>, progress));
      break;
    case "business_goals":
      Object.assign(updateObj, buildBusinessGoalsUpdate(data as Partial<OnboardingData>, progress));
      break;
    case "experience_personalization":
      Object.assign(updateObj, buildExperiencePersonalizationUpdate(data as Partial<OnboardingData>, progress));
      break;
    case "complementary_info":
      Object.assign(updateObj, buildComplementaryInfoUpdate(data as Partial<OnboardingData>, progress));
      break;
    case "goals":
      Object.assign(updateObj, buildGoalsUpdate(data as Partial<OnboardingData>, progress));
      break;
    default:
      console.log(`Usando lógica genérica para etapa: ${stepId}`);
      // Lógica genérica para outras etapas
      const sectionKey = steps.find(s => s.id === stepId)?.section as keyof OnboardingData;
      if (sectionKey && (data as any)[sectionKey]) {
        const existingData = progress[sectionKey as keyof OnboardingProgress] || {};
        if (typeof existingData === "object") {
          updateObj[sectionKey] = {
            ...existingData,
            ...((data as any)[sectionKey] as object)
          };
        } else {
          updateObj[sectionKey] = (data as any)[sectionKey];
        }
      } else {
        // Se não houver uma seção específica, tentar usar o próprio data
        console.log("Dados brutos recebidos:", data);
        Object.assign(updateObj, data);
      }
  }

  console.log("Objeto de atualização construído:", updateObj);

  // Progresso: marcar etapa como concluída se ainda não estava
  if (!progress.completed_steps?.includes(stepId)) {
    updateObj.completed_steps = [...(progress.completed_steps || []), stepId];
  }

  // Atualiza current_step para a próxima etapa
  let nextStep = stepId;
  if (stepId === "personal") {
    nextStep = "professional_data";
  } else if (stepId === "professional_data") {
    nextStep = "business_context";
  } else if (stepId === "business_context") {
    nextStep = "ai_exp";
  } else if (stepId === "ai_exp") {
    nextStep = "business_goals";
  } else if (stepId === "business_goals") {
    nextStep = "experience_personalization";
  } else if (stepId === "experience_personalization") {
    nextStep = "complementary_info";
  } else if (stepId === "complementary_info") {
    nextStep = "review";
  } else if (stepId === "review") {
    nextStep = "completed";
  } else if (stepId === "goals") {
    nextStep = "business_context";
  } else {
    // Se não tem um mapeamento específico, tenta usar o índice para o próximo passo
    const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    nextStep = steps[nextStepIndex]?.id || nextStep;
  }
  updateObj.current_step = nextStep;

  return updateObj;
}
