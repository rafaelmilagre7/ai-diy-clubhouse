
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildAiExperienceUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingExp: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.ai_experience === 'string') {
      try {
        // Verificar se é uma string válida antes de tentar trim
        const stringValue = String(progress.ai_experience);
        const trimmedValue = stringValue && typeof stringValue.trim === 'function' ? 
          stringValue.trim() : 
          stringValue;
          
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
    // Processar campos de array para previous_tools
    if ('previous_tools' in sourceData) {
      const previousTools = Array.isArray(sourceData.previous_tools) ? 
        sourceData.previous_tools : 
        [sourceData.previous_tools].filter(Boolean);
        
      if (previousTools.length > 0) {
        updateObj.ai_experience.previous_tools = previousTools;
      }
    }
    
    // Processar campos de array para desired_ai_areas
    if ('desired_ai_areas' in sourceData) {
      const desiredAreas = Array.isArray(sourceData.desired_ai_areas) ? 
        sourceData.desired_ai_areas : 
        [sourceData.desired_ai_areas].filter(Boolean);
        
      if (desiredAreas.length > 0) {
        updateObj.ai_experience.desired_ai_areas = desiredAreas;
      }
    }
    
    // Processar outros campos
    ['knowledge_level', 'has_implemented', 'improvement_suggestions'].forEach(field => {
      if (field in sourceData && sourceData[field as keyof typeof sourceData] !== undefined) {
        updateObj.ai_experience[field] = sourceData[field as keyof typeof sourceData];
      }
    });
    
    // Processar campos booleanos
    ['completed_formation', 'is_member_for_month'].forEach(field => {
      if (field in sourceData && sourceData[field as keyof typeof sourceData] !== undefined) {
        updateObj.ai_experience[field] = !!sourceData[field as keyof typeof sourceData];
      }
    });
    
    // Processar campo numérico
    if ('nps_score' in sourceData && sourceData.nps_score !== undefined) {
      updateObj.ai_experience.nps_score = typeof sourceData.nps_score === 'string' ? 
        parseInt(sourceData.nps_score, 10) : 
        sourceData.nps_score;
    }
  }
  
  console.log("Objeto de atualização para ai_experience:", updateObj);
  
  return updateObj;
}
