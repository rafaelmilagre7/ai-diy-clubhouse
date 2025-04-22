
import { OnboardingProgress } from "@/types/onboarding";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";
import { buildGoalsUpdate } from "./stepBuilders/goalsBuilder";

/**
 * Constrói o objeto de atualização com base no ID da etapa e nos dados fornecidos
 * Encaminha para builders específicos de cada etapa quando disponíveis
 */
export function buildUpdateObject(
  stepId: string,
  data: any,
  progress: OnboardingProgress | null,
  currentStepIndex: number = -1
): Record<string, any> {
  console.log(`Construindo objeto de atualização para o passo "${stepId}" com dados:`, data);
  
  // Objeto base que será atualizado com os dados específicos da etapa
  const baseUpdateObj: Record<string, any> = {};
  
  // Atualizar a etapa atual e as etapas concluídas
  if (progress) {
    // Atualizar etapa atual
    baseUpdateObj.current_step = getNextStepId(stepId);
    
    // Atualizar etapas concluídas (adicionar esta etapa se não estiver na lista)
    const completedSteps = Array.isArray(progress.completed_steps) 
      ? [...progress.completed_steps] 
      : [];
      
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
      baseUpdateObj.completed_steps = completedSteps;
    }
  }
  
  // Selecionar o builder adequado com base no ID da etapa
  let specificUpdateObj: Record<string, any> = {};
  
  switch (stepId) {
    case "personal":
      specificUpdateObj = {
        personal_info: data.personal_info || data
      };
      break;
      
    case "professional_data":
      specificUpdateObj = buildProfessionalDataUpdate(data, progress);
      break;
      
    case "business_context":
      specificUpdateObj = {
        business_context: data.business_context || data,
        business_data: data.business_context || data // Para compatibilidade
      };
      break;
      
    case "ai_exp":
      specificUpdateObj = {
        ai_experience: data.ai_experience || data
      };
      break;
      
    case "business_goals":
      specificUpdateObj = buildGoalsUpdate(data, progress);
      break;
      
    case "experience_personalization":
      specificUpdateObj = {
        experience_personalization: data.experience_personalization || data
      };
      break;
      
    case "complementary_info":
      specificUpdateObj = {
        complementary_info: data.complementary_info || data
      };
      break;
      
    default:
      // Para etapas sem um builder específico, usar o campo bruto se disponível, ou os dados diretamente
      if (data[stepId]) {
        specificUpdateObj[stepId] = data[stepId];
      } else {
        specificUpdateObj[stepId] = data;
      }
  }
  
  // Mesclar os objetos
  const updateObj = { ...baseUpdateObj, ...specificUpdateObj };
  
  // Log para depuração
  console.log("Objeto de atualização final:", updateObj);
  
  return updateObj;
}

/**
 * Determina o ID da próxima etapa com base no ID atual
 */
function getNextStepId(currentStepId: string): string {
  const stepSequence: Record<string, string> = {
    "personal": "professional_data",
    "professional_data": "business_context",
    "business_context": "ai_exp",
    "ai_exp": "business_goals",
    "business_goals": "experience_personalization",
    "experience_personalization": "complementary_info",
    "complementary_info": "review",
    "review": "completed"
  };
  
  return stepSequence[currentStepId] || currentStepId;
}
