
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { buildBusinessContextUpdate } from "./businessContextBuilder";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";
import { buildAiExpUpdate } from "./stepBuilders/aiExpBuilder";
import { buildPersonalUpdate } from "./stepBuilders/personalBuilder";
import { buildBaseUpdate } from "./stepBuilders/baseBuilder";

/**
 * Função principal buildUpdateObject que centraliza a construção
 * de objetos de atualização para cada etapa do onboarding
 */
export function buildUpdateObject(
  stepId: string, 
  data: any, 
  progress: OnboardingProgress | null, 
  currentStepIndex: number
) {
  console.log(`Construindo objeto de atualização para passo ${stepId}`, data);
  
  // Objeto base para atualização
  const updateObj: any = {};
  
  // Processar dados com base no ID da etapa usando builders específicos
  switch (stepId) {
    case "personal":
      // Dados pessoais usando o builder específico
      console.log("Processando dados pessoais:", data);
      const personalUpdates = buildPersonalUpdate(data, progress);
      Object.assign(updateObj, personalUpdates);
      break;
      
    case "professional_data":
      // Dados profissionais com builder específico
      console.log("Processando dados profissionais:", data);
      const professionalUpdates = buildProfessionalDataUpdate(data, progress);
      Object.assign(updateObj, professionalUpdates);
      break;
      
    case "business_context":
      // Dados de contexto de negócio
      console.log("Processando dados de contexto de negócio:", data);
      const businessContextUpdates = buildBusinessContextUpdate(data, progress);
      Object.assign(updateObj, businessContextUpdates);
      break;
      
    case "ai_exp":
      // Experiência com IA
      console.log("Processando dados de experiência com IA:", data);
      const aiExpUpdates = buildAiExpUpdate(data, progress);
      Object.assign(updateObj, aiExpUpdates);
      break;
      
    case "business_goals":
      // Objetivos de negócio
      console.log("Processando dados de objetivos de negócio:", data);
      const businessGoalsUpdates = buildBaseUpdate("business_goals", data, progress, {
        topLevelFields: []
      });
      Object.assign(updateObj, businessGoalsUpdates);
      break;
      
    case "experience_personalization":
      // Personalização de experiência
      console.log("Processando dados de personalização:", data);
      const personalizationUpdates = buildBaseUpdate("experience_personalization", data, progress, {
        topLevelFields: []
      });
      Object.assign(updateObj, personalizationUpdates);
      break;
      
    case "complementary_info":
      // Informações complementares
      console.log("Processando informações complementares:", data);
      const complementaryUpdates = buildBaseUpdate("complementary_info", data, progress, {
        topLevelFields: []
      });
      Object.assign(updateObj, complementaryUpdates);
      break;
      
    default:
      console.warn(`Passo não reconhecido: ${stepId}. Usando builder genérico.`);
      // Usar builder genérico para passos desconhecidos
      const genericUpdates = buildBaseUpdate(stepId, data, progress, {});
      Object.assign(updateObj, genericUpdates);
  }

  // Atualizar campo completed_steps para incluir a etapa atual
  if (progress && progress.completed_steps) {
    // Garantir que completed_steps seja um array
    const stepsCompleted = Array.isArray(progress.completed_steps) ? 
                          [...progress.completed_steps] : 
                          [];
                          
    if (!stepsCompleted.includes(stepId)) {
      stepsCompleted.push(stepId);
      updateObj.completed_steps = stepsCompleted;
      console.log(`Adicionando ${stepId} aos passos completados:`, stepsCompleted);
    }
  } else {
    updateObj.completed_steps = [stepId];
    console.log(`Iniciando passos completados com ${stepId}`);
  }

  // Definir a etapa atual como a próxima após a conclusão
  if (typeof currentStepIndex === 'number') {
    const nextIndex = currentStepIndex + 1;
    const steps = [
      "personal", 
      "professional_data", 
      "business_context", 
      "ai_exp", 
      "business_goals", 
      "experience_personalization", 
      "complementary_info", 
      "review"
    ];
    
    if (nextIndex < steps.length) {
      updateObj.current_step = steps[nextIndex];
      console.log(`Atualizando passo atual para: ${steps[nextIndex]}`);
    }
  }

  console.log("Objeto de atualização final:", updateObj);
  return updateObj;
}
