
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildAiExpUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingExp: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.ai_experience === 'string') {
      try {
        const trimmedValue = typeof progress.ai_experience === 'string' && progress.ai_experience.trim ? 
          progress.ai_experience.trim() : 
          progress.ai_experience;
          
        if (trimmedValue !== '') {
          existingExp = JSON.parse(trimmedValue);
        }
      } catch (e) {
        console.error("Erro ao converter ai_experience de string para objeto:", e);
      }
    } else if (progress.ai_experience && typeof progress.ai_experience === 'object') {
      existingExp = progress.ai_experience;
    }
  }
  
  // Inicializar o objeto de atualização com os dados existentes
  updateObj.ai_experience = {...existingExp};
  
  // Verificar se estamos recebendo dados diretos ou em um objeto aninhado
  const sourceData = data.ai_experience || data;
  
  if (typeof sourceData === 'object' && sourceData !== null) {
    // Processar campos de array
    if (sourceData.previous_tools) {
      const previousTools = Array.isArray(sourceData.previous_tools) ? 
        sourceData.previous_tools : 
        [sourceData.previous_tools].filter(Boolean);
        
      if (previousTools.length > 0) {
        updateObj.ai_experience.previous_tools = previousTools;
      }
    }
    
    if (sourceData.desired_ai_areas) {
      const desiredAreas = Array.isArray(sourceData.desired_ai_areas) ? 
        sourceData.desired_ai_areas : 
        [sourceData.desired_ai_areas].filter(Boolean);
        
      if (desiredAreas.length > 0) {
        updateObj.ai_experience.desired_ai_areas = desiredAreas;
      }
    }
    
    // Processar outros campos
    ['knowledge_level', 'has_implemented', 'improvement_suggestions'].forEach(field => {
      if (sourceData[field] !== undefined) {
        updateObj.ai_experience[field] = sourceData[field];
      }
    });
    
    // Processar campos booleanos
    ['completed_formation', 'is_member_for_month'].forEach(field => {
      if (sourceData[field] !== undefined) {
        updateObj.ai_experience[field] = !!sourceData[field];
      }
    });
    
    // Processar campo numérico
    if (sourceData.nps_score !== undefined) {
      updateObj.ai_experience.nps_score = typeof sourceData.nps_score === 'string' ? 
        parseInt(sourceData.nps_score, 10) : 
        sourceData.nps_score;
    }
  }
  
  console.log("Objeto de atualização para ai_experience:", updateObj);
  
  return updateObj;
}
