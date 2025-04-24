
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildPersonalInfoUpdate } from "./stepBuilders/personalInfoBuilder";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";
import { buildBusinessGoalsUpdate } from "./stepBuilders/businessGoalsBuilder";
import { buildAiExperienceUpdate } from "./stepBuilders/aiExperienceBuilder";
import { buildExperiencePersonalizationUpdate } from "./stepBuilders/experiencePersonalizationBuilder";
import { buildComplementaryInfoUpdate } from "./stepBuilders/complementaryInfoBuilder";

/**
 * Constrói o objeto de atualização para o progresso do onboarding
 * baseado no ID da etapa e nos dados enviados
 */
export function buildUpdateObject(
  stepId: string,
  data: Partial<OnboardingData>,
  progress: OnboardingProgress | null,
  currentIndex: number
): Partial<OnboardingProgress> {
  console.log(`Construindo objeto de atualização para passo ${stepId}`);
  
  // Objeto base de atualização
  let updateObj: Partial<OnboardingProgress> = {
    // Adicionar o passo atual às etapas concluídas, se já não estiver lá
    completed_steps: progress?.completed_steps?.includes(stepId) 
      ? progress.completed_steps 
      : [...(progress?.completed_steps || []), stepId]
  };
  
  // Construir objeto específico baseado no stepId
  let stepUpdateObj: Partial<OnboardingProgress> = {};
  
  // Usar o builder correto com base no stepId
  switch (stepId) {
    case "personal":
      stepUpdateObj = buildPersonalInfoUpdate(data, progress);
      break;
      
    case "professional_data":
      stepUpdateObj = buildProfessionalDataUpdate(data, progress);
      break;
      
    case "business_goals":
      stepUpdateObj = buildBusinessGoalsUpdate(data, progress);
      break;
      
    case "ai_exp":
      stepUpdateObj = buildAiExperienceUpdate(data, progress);
      break;
      
    case "experience_personalization":
      stepUpdateObj = buildExperiencePersonalizationUpdate(data, progress);
      break;
      
    case "complementary_info":
      stepUpdateObj = buildComplementaryInfoUpdate(data, progress);
      break;
      
    // Adicionar outros casos conforme necessário
      
    default:
      console.warn(`Builder não encontrado para stepId: ${stepId}, usando dados diretos`);
      
      // Fallback: usar o próprio dado se não houver builder específico
      if (data[stepId as keyof typeof data]) {
        stepUpdateObj = {
          [stepId]: data[stepId as keyof typeof data]
        };
      } else {
        // Se não houver dados específicos para o stepId, usar os dados completos
        stepUpdateObj = { ...data };
      }
  }
  
  // Mesclagem dos objetos de atualização
  updateObj = {
    ...updateObj,
    ...stepUpdateObj
  };
  
  console.log(`Objeto de atualização construído para ${stepId}:`, updateObj);
  
  return updateObj;
}
