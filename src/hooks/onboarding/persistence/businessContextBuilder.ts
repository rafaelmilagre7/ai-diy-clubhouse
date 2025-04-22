
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Builder específico para dados de contexto de negócio
 * Processa e normaliza os dados para facilitar interpretação por IA
 */
export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("Construindo objeto de atualização para Business Context:", data);
  
  // Verificar se os dados vêm no formato aninhado ou direto
  if (data.business_context) {
    // Formato aninhado: { business_context: { ... } }
    const contextData = data.business_context;
    const existingBusinessData = progress && 'business_data' in progress ? progress.business_data : {};
    
    // Garantir que existingBusinessData seja um objeto
    const baseBusinessData = typeof existingBusinessData === 'string' ? {} : existingBusinessData || {};
    
    // Garantir que arrays sejam mantidos como arrays
    let formattedData = { ...contextData };
    
    // Garantir que arrays permaneçam como arrays
    ['business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis'].forEach(field => {
      if (formattedData[field as keyof typeof formattedData] && !Array.isArray(formattedData[field as keyof typeof formattedData])) {
        (formattedData as any)[field] = [(formattedData as any)[field]];
      }
    });
    
    // Salvar apenas em business_data (coluna existente na tabela)
    if (progress && 'business_data' in progress) {
      updateObj.business_data = {
        ...baseBusinessData,
        ...formattedData,
        _last_updated: new Date().toISOString()
      };
    }
    
    // Para compatibilidade, salvar explicitamente em business_context também
    updateObj.business_context = {
      ...formattedData,
      _last_updated: new Date().toISOString()
    };
    
    console.log("Objeto de atualização gerado:", updateObj);
  } else if (typeof data === 'object' && data !== null) {
    // Formato direto: dados enviados diretamente
    const existingBusinessData = progress && 'business_data' in progress ? progress.business_data : {};
    
    // Garantir que existingBusinessData seja um objeto
    const baseBusinessData = typeof existingBusinessData === 'string' ? {} : existingBusinessData || {};
    
    let formattedData = { ...data };
    
    // Garantir que arrays permaneçam como arrays
    ['business_challenges', 'short_term_goals', 'medium_term_goals', 'important_kpis'].forEach(field => {
      if (formattedData[field as keyof typeof formattedData] && !Array.isArray(formattedData[field as keyof typeof formattedData])) {
        (formattedData as any)[field] = [(formattedData as any)[field]];
      }
    });
    
    // Salvar em business_data se existir no progresso
    if (progress && 'business_data' in progress) {
      updateObj.business_data = {
        ...baseBusinessData,
        ...formattedData,
        _last_updated: new Date().toISOString()
      };
    }
    
    // Para compatibilidade, salvar explicitamente em business_context também
    updateObj.business_context = {
      ...formattedData,
      _last_updated: new Date().toISOString()
    };
  }
  
  return updateObj;
}
