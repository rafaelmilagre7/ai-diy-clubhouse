
// Se este arquivo já existir, adicionar a importação e a referência ao novo builder
import { buildPersonalInfoUpdate } from "./stepBuilders/personalInfoBuilder";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";
import { buildBusinessContextUpdate } from "./stepBuilders/businessContextBuilder";
import { buildAiExperienceUpdate } from "./stepBuilders/aiExperienceBuilder";
import { buildBusinessGoalsUpdate } from "./stepBuilders/businessGoalsBuilder";
import { buildExperiencePersonalizationUpdate } from "./stepBuilders/experiencePersonalizationBuilder";
import { buildComplementaryInfoUpdate } from "./stepBuilders/complementaryInfoBuilder";
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Constrói o objeto para atualização com base no ID da etapa
 */
export function buildUpdateObject(
  stepId: string,
  data: Partial<OnboardingData>,
  progress: OnboardingProgress | null,
  currentStepIndex: number
) {
  console.log(`Construindo objeto de atualização para passo ${stepId} com dados:`, data);
  console.log(`Estado atual do progresso: `, progress);
  
  // Objeto de atualização base
  let updateObj: any = {
    current_step: stepId,
  };
  
  // Adicionar à lista de passos concluídos
  if (progress?.completed_steps) {
    // Garantir que é um array
    let completedSteps = Array.isArray(progress.completed_steps) 
      ? progress.completed_steps 
      : progress.completed_steps ? [progress.completed_steps] : [];
    
    // Adicionar apenas se ainda não estiver na lista
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }
    
    updateObj.completed_steps = completedSteps;
  } else {
    updateObj.completed_steps = [stepId];
  }
  
  // Atualizar dados específicos com base na etapa
  switch (stepId) {
    case "personal_info":
      Object.assign(updateObj, buildPersonalInfoUpdate(data, progress));
      break;
      
    case "professional_data":
      Object.assign(updateObj, buildProfessionalDataUpdate(data, progress));
      break;
      
    case "business_context":
      Object.assign(updateObj, buildBusinessContextUpdate(data, progress));
      break;
      
    case "ai_experience":
      Object.assign(updateObj, buildAiExperienceUpdate(data, progress));
      break;
      
    case "business_goals":
      Object.assign(updateObj, buildBusinessGoalsUpdate(data, progress));
      break;
      
    case "experience_personalization":
      Object.assign(updateObj, buildExperiencePersonalizationUpdate(data, progress));
      break;
      
    case "complementary_info":
      Object.assign(updateObj, buildComplementaryInfoUpdate(data, progress));
      break;
      
    default:
      // Se não reconhecermos o ID, apenas adicionamos os dados ao objeto
      console.warn(`ID de etapa não reconhecido: ${stepId}, passando dados diretos`);
      if (Object.keys(data).length > 0) {
        // Mesclar com objeto principal preservando estrutura
        Object.assign(updateObj, data);
      }
  }
  
  console.log("Objeto de atualização final:", updateObj);
  
  return updateObj;
}
