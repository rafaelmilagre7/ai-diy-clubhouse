
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  const existingComplementaryInfo = progress?.complementary_info || {};
  
  if ((data as any).complementary_info) {
    // Caso em que recebemos um objeto com a chave complementary_info
    const complementaryData = (data as any).complementary_info;
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      ...complementaryData
    };
    
    // Garantir que arrays sejam tratados corretamente
    if (complementaryData.priority_topics && !Array.isArray(complementaryData.priority_topics)) {
      updateObj.complementary_info.priority_topics = [complementaryData.priority_topics];
    }
    
    // Garantir que booleanos sejam tratados corretamente
    ['authorize_case_usage', 'interested_in_interview'].forEach(field => {
      if (complementaryData[field] !== undefined) {
        if (typeof complementaryData[field] === 'string') {
          updateObj.complementary_info[field] = 
            complementaryData[field].toLowerCase() === 'true' || 
            complementaryData[field].toLowerCase() === 'sim' || 
            complementaryData[field] === '1';
        }
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    // Caso em que recebemos dados diretos
    updateObj.complementary_info = {
      ...existingComplementaryInfo
    };
    
    // Copiar campos relevantes
    ['how_found_us', 'referred_by', 'authorize_case_usage', 
     'interested_in_interview', 'priority_topics'].forEach(field => {
      if ((data as any)[field] !== undefined) {
        const value = (data as any)[field];
        
        // Garantir que campos que devem ser arrays sejam tratados corretamente
        if (field === 'priority_topics' && !Array.isArray(value) && value !== null) {
          updateObj.complementary_info[field] = [value];
        } else if (['authorize_case_usage', 'interested_in_interview'].includes(field) && typeof value === 'string') {
          // Converter strings para booleanos
          updateObj.complementary_info[field] = 
            value.toLowerCase() === 'true' || 
            value.toLowerCase() === 'sim' || 
            value === '1';
        } else {
          updateObj.complementary_info[field] = value;
        }
      }
    });
  }
  
  return updateObj;
}
