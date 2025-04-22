
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("Construindo objeto de atualização para Business Context:", data);
  
  // Verificar se os dados vêm no formato aninhado ou direto
  if (data.business_context) {
    // Formato aninhado: { business_context: { ... } }
    const contextData = data.business_context;
    const existingBusinessData = progress?.business_data || {};
    
    // Garantir que arrays sejam mantidos como arrays
    let formattedData = { ...contextData };
    
    // Garantir que arrays permaneçam como arrays
    ['business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    // Salvar em business_data (coluna existente na tabela)
    updateObj.business_data = {
      ...existingBusinessData,
      ...formattedData,
    };
    
    // Log detalhado para rastreamento
    console.log("Dados de contexto de negócio formatados:", formattedData);
    console.log("Objeto de atualização gerado:", updateObj);
  } else if (typeof data === 'object' && data !== null) {
    // Formato direto: dados enviados diretamente
    const existingBusinessData = progress?.business_data || {};
    
    let formattedData = { ...data };
    
    // Garantir que arrays permaneçam como arrays
    ['business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.business_data = {
      ...existingBusinessData,
      ...formattedData,
    };
    
    // Log detalhado para rastreamento
    console.log("Dados de contexto de negócio formatados (formato direto):", formattedData);
    console.log("Objeto de atualização gerado:", updateObj);
  }
  
  return updateObj;
}
