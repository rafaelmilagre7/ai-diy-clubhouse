
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Função para normalizar dados de experiência com IA
 */
function normalizeAIExperience(data: any): any {
  if (!data || typeof data !== 'object') {
    return {};
  }

  // Garantir que campos de array são realmente arrays
  const ensureArray = (field: any) => Array.isArray(field) ? field : [];
  
  // Objeto normalizado
  const normalized = { ...data };
  
  // Normalizar arrays
  if ('previous_tools' in normalized) {
    normalized.previous_tools = ensureArray(normalized.previous_tools);
  }
  
  if ('desired_ai_areas' in normalized) {
    normalized.desired_ai_areas = ensureArray(normalized.desired_ai_areas);
  }
  
  // Normalizar valores booleanos
  if ('completed_formation' in normalized) {
    normalized.completed_formation = !!normalized.completed_formation;
  }
  
  if ('is_member_for_month' in normalized) {
    normalized.is_member_for_month = !!normalized.is_member_for_month;
  }
  
  // Normalizar score numérico
  if ('nps_score' in normalized) {
    const score = normalized.nps_score;
    normalized.nps_score = typeof score === 'string' ? parseInt(score, 10) || 0 : (score || 0);
  }
  
  return normalized;
}

export function buildAiExpUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingExp: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.ai_experience === 'string') {
      try {
        // Verificar se é uma string válida antes de tentar trim
        const stringValue = String(progress.ai_experience || '');
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
        
      updateObj.ai_experience.previous_tools = previousTools;
    }
    
    // Processar campos de array para desired_ai_areas
    if ('desired_ai_areas' in sourceData) {
      const desiredAreas = Array.isArray(sourceData.desired_ai_areas) ? 
        sourceData.desired_ai_areas : 
        [sourceData.desired_ai_areas].filter(Boolean);
        
      updateObj.ai_experience.desired_ai_areas = desiredAreas;
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
  
  // Normalizar dados finais
  updateObj.ai_experience = normalizeAIExperience(updateObj.ai_experience);
  
  console.log("Objeto de atualização para ai_experience:", updateObj);
  
  return updateObj;
}
