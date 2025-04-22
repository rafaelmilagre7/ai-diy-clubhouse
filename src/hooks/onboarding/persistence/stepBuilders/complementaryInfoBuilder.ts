
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingInfo = progress?.complementary_info || {};
  
  // Se os dados existentes forem uma string, tentar convertê-los para objeto
  if (typeof existingInfo === 'string') {
    try {
      // Verificar se a string não está vazia antes de tentar parsear
      if (existingInfo && existingInfo.trim() !== '') {
        existingInfo = JSON.parse(existingInfo);
      } else {
        existingInfo = {};
      }
    } catch (e) {
      console.error("Erro ao converter complementary_info de string para objeto:", e);
      existingInfo = {};
    }
  } else if (typeof existingInfo === 'string' && existingInfo === '') {
    // Se for string vazia, transformar em objeto vazio
    existingInfo = {};
  }
  
  // Inicializar o objeto de atualização com os dados existentes
  updateObj.complementary_info = {...existingInfo};
  
  // Verificar se estamos recebendo dados diretos ou em um objeto aninhado
  if ((data as any).complementary_info) {
    const complementaryData = (data as any).complementary_info;
    
    // Processar campos individuais
    Object.entries(complementaryData).forEach(([key, value]) => {
      if (key === 'priority_topics') {
        // Tratar array de tópicos prioritários
        if (value !== null && value !== undefined) {
          if (!Array.isArray(value)) {
            updateObj.complementary_info[key] = [value];
          } else {
            updateObj.complementary_info[key] = value;
          }
        }
      } else if (['authorize_case_usage', 'interested_in_interview'].includes(key)) {
        // Garantir que valores booleanos sejam tratados corretamente
        updateObj.complementary_info[key] = !!value;
      } else if (value !== undefined) {
        // Para outros campos, usar o valor diretamente
        updateObj.complementary_info[key] = value;
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    // Verificar se estamos trabalhando com dados diretos
    const receivedData = data as any;
    
    // Processar campos individuais
    if (receivedData.how_found_us !== undefined) {
      updateObj.complementary_info.how_found_us = receivedData.how_found_us;
    }
    if (receivedData.referred_by !== undefined) {
      updateObj.complementary_info.referred_by = receivedData.referred_by;
    }
    
    // Usar verificações explícitas para valores booleanos (podem ser false)
    if (receivedData.authorize_case_usage !== undefined) {
      updateObj.complementary_info.authorize_case_usage = !!receivedData.authorize_case_usage;
    }
    if (receivedData.interested_in_interview !== undefined) {
      updateObj.complementary_info.interested_in_interview = !!receivedData.interested_in_interview;
    }
    
    // Verificar e processar arrays
    if (receivedData.priority_topics) {
      if (!Array.isArray(receivedData.priority_topics)) {
        updateObj.complementary_info.priority_topics = [receivedData.priority_topics];
      } else {
        updateObj.complementary_info.priority_topics = receivedData.priority_topics;
      }
    }
  }
  
  console.log("Construindo atualização para complementary_info:", updateObj);
  
  return updateObj;
}
