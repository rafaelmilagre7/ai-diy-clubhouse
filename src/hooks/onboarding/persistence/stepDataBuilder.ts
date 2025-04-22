
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildPersonalInfoUpdate } from "./stepBuilders/personalInfoBuilder";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";
import { buildBusinessGoalsUpdate } from "./stepBuilders/businessGoalsBuilder";
import { buildAIExperienceUpdate } from "./stepBuilders/aiExperienceBuilder";
import { buildExperiencePersonalizationUpdate } from "./stepBuilders/experiencePersonalizationBuilder";

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
      stepUpdateObj = buildAIExperienceUpdate(data, progress);
      break;
      
    // Adicionar outros casos conforme necessário
    
    default:
      console.log(`Nenhum builder específico para o passo ${stepId}`);
      // Manter os dados como estão se não houver builder específico
  }
  
  // Mesclar os objetos
  updateObj = {
    ...updateObj,
    ...stepUpdateObj
  };
  
  console.log(`Objeto de atualização final:`, updateObj);
  
  return updateObj;
}
