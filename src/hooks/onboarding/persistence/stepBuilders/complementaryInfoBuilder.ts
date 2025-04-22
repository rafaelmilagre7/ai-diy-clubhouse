
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  const existingInfo = progress?.complementary_info || {};
  
  // Garantir que temos um objeto para complementary_info, não uma string
  const complementaryInfoBase = typeof existingInfo === 'string' 
    ? {} 
    : (existingInfo as Record<string, any>);
  
  if ((data as any).complementary_info) {
    const complementaryData = (data as any).complementary_info;
    
    updateObj.complementary_info = {
      ...complementaryInfoBase,
      ...complementaryData
    };
  } else if (typeof data === 'object' && data !== null) {
    // Verificar se estamos trabalhando com dados diretos
    const receivedData = data as any;
    
    // Inicializar com dados existentes
    updateObj.complementary_info = { ...complementaryInfoBase };
    
    // Adicionar novos dados
    if (receivedData.how_found_us) updateObj.complementary_info.how_found_us = receivedData.how_found_us;
    if (receivedData.referred_by) updateObj.complementary_info.referred_by = receivedData.referred_by;
    if (receivedData.authorize_case_usage !== undefined) {
      updateObj.complementary_info.authorize_case_usage = receivedData.authorize_case_usage;
    }
    if (receivedData.interested_in_interview !== undefined) {
      updateObj.complementary_info.interested_in_interview = receivedData.interested_in_interview;
    }
    if (receivedData.priority_topics) {
      updateObj.complementary_info.priority_topics = receivedData.priority_topics;
    }
  }
  
  console.log("Construindo atualização para complementary_info:", updateObj);
  
  return updateObj;
}
