
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Verificar se os dados vêm no formato aninhado ou direto
  if (data.business_context) {
    // Formato aninhado: { business_context: { ... } }
    const contextData = data.business_context;
    const existingBusinessData = progress?.business_data || {};
    
    // Salvar apenas em business_data (coluna existente na tabela)
    updateObj.business_data = {
      ...existingBusinessData,
      ...contextData,
    };
    
    // Log detalhado para rastreamento
    console.log("Dados de contexto de negócio (formato aninhado):", contextData);
    console.log("Objeto de atualização gerado:", updateObj);
  } else if (typeof data === 'object' && data !== null) {
    // Formato direto: dados enviados diretamente
    const existingBusinessData = progress?.business_data || {};
    updateObj.business_data = {
      ...existingBusinessData,
      ...data,
    };
    
    // Log detalhado para rastreamento
    console.log("Dados de contexto de negócio (formato direto):", data);
    console.log("Objeto de atualização gerado:", updateObj);
  }
  
  return updateObj;
}
