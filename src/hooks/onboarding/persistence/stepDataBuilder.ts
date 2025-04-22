
import { OnboardingProgress } from "@/types/onboarding";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";
import { buildBusinessGoalsUpdate } from "./stepBuilders/businessGoalsBuilder";
import { buildComplementaryInfoUpdate } from "./stepBuilders/complementaryInfoBuilder";
import { buildAiExpUpdate } from "./stepBuilders/aiExpBuilder";
import { buildExperiencePersonalizationUpdate } from "./stepBuilders/experiencePersonalizationBuilder";

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
    baseUpdateObj.current_step = getNextStepId(stepId);
    
    const completedSteps = Array.isArray(progress.completed_steps) 
      ? [...progress.completed_steps] 
      : [];
      
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
      baseUpdateObj.completed_steps = completedSteps;
    }
  }
  
  // Verificar se temos dados para processar
  if (!data) {
    console.warn(`Dados vazios para o passo "${stepId}"`);
    return baseUpdateObj;
  }
  
  // Se os dados forem uma string, tentar converter para objeto
  let processedData = data;
  if (typeof data === 'string' && data !== "{}" && data !== "") {
    try {
      processedData = JSON.parse(data);
      console.log(`Dados do passo "${stepId}" convertidos de string para objeto:`, processedData);
    } catch (e) {
      console.error(`Erro ao converter dados do passo "${stepId}" de string para objeto:`, e);
      processedData = {};
    }
  }
  
  // Selecionar o builder adequado com base no ID da etapa
  let specificUpdateObj: Record<string, any> = {};
  
  switch (stepId) {
    case "personal":
      specificUpdateObj = {
        personal_info: processedData.personal_info || processedData
      };
      break;
      
    case "professional_data":
    case "goals":
      specificUpdateObj = buildProfessionalDataUpdate(processedData, progress);
      break;
      
    case "business_context":
      specificUpdateObj = {
        business_context: processedData.business_context || processedData,
        business_data: processedData.business_context || processedData // Para compatibilidade
      };
      break;
      
    case "ai_exp":
      specificUpdateObj = buildAiExpUpdate(processedData, progress);
      break;
      
    case "business_goals":
      // Importante: garantir que usamos o builder específico para business_goals
      console.log("Usando buildBusinessGoalsUpdate para processar dados de negócio:", processedData);
      specificUpdateObj = buildBusinessGoalsUpdate(processedData, progress);
      break;
      
    case "experience_personalization":
      specificUpdateObj = buildExperiencePersonalizationUpdate(processedData, progress);
      break;
      
    case "complementary_info":
      specificUpdateObj = buildComplementaryInfoUpdate(processedData, progress);
      break;
      
    default:
      // Para etapas sem um builder específico, usar o campo bruto se disponível
      if (processedData[stepId]) {
        specificUpdateObj[stepId] = processedData[stepId];
      } else {
        specificUpdateObj[stepId] = processedData;
      }
  }
  
  // Mesclar os objetos
  const updateObj = { ...baseUpdateObj, ...specificUpdateObj };
  console.log("Objeto de atualização final:", updateObj);
  
  return updateObj;
}

function getNextStepId(currentStepId: string): string {
  const stepSequence: Record<string, string> = {
    "personal": "professional_data",
    "professional_data": "business_context",
    "business_context": "ai_exp",
    "ai_exp": "business_goals",
    "business_goals": "experience_personalization",
    "experience_personalization": "complementary_info",
    "complementary_info": "review",
    "goals": "business_context" // Para compatibilidade com o fluxo antigo
  };
  
  return stepSequence[currentStepId] || currentStepId;
}
