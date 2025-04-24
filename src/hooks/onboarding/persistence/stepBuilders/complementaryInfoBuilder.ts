
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingInfo: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.complementary_info === 'string') {
      try {
        // Verificar se é uma string válida antes de tentar trim
        const stringValue = String(progress.complementary_info);
        const trimmedValue = stringValue && typeof stringValue.trim === 'function' ? 
          stringValue.trim() : 
          stringValue;
          
        if (trimmedValue !== '') {
          existingInfo = JSON.parse(trimmedValue);
        }
      } catch (e) {
        console.error("Erro ao converter complementary_info de string para objeto:", e);
      }
    } else if (progress.complementary_info && typeof progress.complementary_info === 'object') {
      existingInfo = progress.complementary_info;
    }
  }
  
  // Inicializar o objeto de atualização com os dados existentes
  updateObj.complementary_info = {...existingInfo};
  
  // Verificar se estamos recebendo dados diretos ou em um objeto aninhado
  const sourceData = data.complementary_info || data;
  
  if (typeof sourceData === 'object' && sourceData !== null) {
    // Processar campos de array
    if ('priority_topics' in sourceData) {
      const priorityTopics = Array.isArray(sourceData.priority_topics) ? 
        sourceData.priority_topics : 
        [sourceData.priority_topics].filter(Boolean);
        
      if (priorityTopics.length > 0) {
        updateObj.complementary_info.priority_topics = priorityTopics;
      }
    }
    
    // Processar campos de texto
    ['how_found_us', 'referred_by'].forEach(field => {
      if (field in sourceData && sourceData[field as keyof typeof sourceData] !== undefined) {
        updateObj.complementary_info[field] = sourceData[field as keyof typeof sourceData];
      }
    });
    
    // Processar campos booleanos
    ['authorize_case_usage', 'interested_in_interview'].forEach(field => {
      if (field in sourceData && sourceData[field as keyof typeof sourceData] !== undefined) {
        updateObj.complementary_info[field] = !!sourceData[field as keyof typeof sourceData];
      }
    });
  }
  
  console.log("Objeto de atualização para complementary_info:", updateObj);
  
  return updateObj;
}
