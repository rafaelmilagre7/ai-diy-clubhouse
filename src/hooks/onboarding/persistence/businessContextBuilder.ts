
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Builder específico para dados de contexto de negócio
 * Processa e normaliza os dados para facilitar interpretação por IA
 */
export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: Record<string, any> = {};
  
  console.log("Construindo objeto de atualização para Business Context:", data);
  
  if (!data || !progress) {
    console.warn("Dados ou progresso não fornecidos para Business Context Builder");
    return updateObj;
  }
  
  try {
    // Verificar se os dados vêm no formato aninhado ou direto
    const contextData = data.business_context || {};
    
    // Garantir que o objeto business_context existe
    updateObj.business_context = {
      ...(typeof progress.business_context === 'object' ? progress.business_context || {} : {}),
      ...contextData,
      _last_updated: new Date().toISOString()
    };
    
    // Remover valores undefined que podem causar erro no Supabase
    Object.keys(updateObj.business_context).forEach(key => {
      if (updateObj.business_context[key] === undefined) {
        delete updateObj.business_context[key];
      }
      
      // Garantir que arrays continuem sendo arrays
      if (Array.isArray(updateObj.business_context[key]) && updateObj.business_context[key].length === 0) {
        updateObj.business_context[key] = [];
      }
    });
    
    // Compatibilidade: copiar para business_data apenas se já existir no progresso atual
    if (progress.business_data !== undefined) {
      // Certificar que business_data é um objeto
      const baseBusinessData = typeof progress.business_data === 'object' && progress.business_data 
        ? progress.business_data 
        : {};
        
      updateObj.business_data = {
        ...baseBusinessData,
        ...updateObj.business_context
      };
    }
    
    console.log("Objeto de atualização gerado:", updateObj);
    return updateObj;
  } catch (error) {
    console.error("Erro ao construir objeto de atualização de Business Context:", error);
    return updateObj;
  }
}
