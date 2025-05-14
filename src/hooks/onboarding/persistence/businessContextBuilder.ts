
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Builder específico para dados de contexto de negócio
 * Processa e normaliza os dados para facilitar interpretação por IA
 */
export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: Record<string, any> = {};
  
  console.log("[businessContextBuilder] Construindo objeto de atualização para Business Context:", data);
  
  if (!data || !progress) {
    console.warn("[businessContextBuilder] Dados ou progresso não fornecidos para Business Context Builder");
    return updateObj;
  }
  
  try {
    // Determinar de onde os dados estão vindo (direto ou aninhado)
    let contextData: Record<string, any>;
    
    // Verificar se os dados vêm como parte do formato aninhado (via data.business_context)
    if (typeof data.business_context === 'object' && data.business_context !== null) {
      contextData = data.business_context;
      console.log("[businessContextBuilder] Usando dados de formato aninhado business_context");
    } 
    // Caso contrário, assumir que os dados são passados diretamente
    else {
      contextData = { ...data };
      console.log("[businessContextBuilder] Usando dados passados diretamente");
    }
    
    // Garantir que o objeto business_context existe no objeto de atualização
    updateObj.business_context = {
      // Manter dados existentes (se houver)
      ...(typeof progress.business_context === 'object' && progress.business_context !== null 
        ? progress.business_context : {}),
      // Adicionar novos dados
      ...contextData,
      // Adicionar timestamp
      _last_updated: new Date().toISOString()
    };
    
    // Remover campos undefined/null que podem causar problemas no Supabase
    Object.keys(updateObj.business_context).forEach(key => {
      if (updateObj.business_context[key] === undefined || updateObj.business_context[key] === null) {
        delete updateObj.business_context[key];
      }
      
      // Garantir que arrays continuem sendo arrays mesmo quando vazios
      if (Array.isArray(updateObj.business_context[key]) && updateObj.business_context[key].length === 0) {
        updateObj.business_context[key] = [];
      }
    });
    
    // Compatibilidade: copiar para business_data apenas se já existir no progresso atual
    // Isso ajuda na transição suave do formato antigo para o novo
    if (progress.business_data !== undefined) {
      // Certificar que business_data é um objeto
      const baseBusinessData = typeof progress.business_data === 'object' && progress.business_data 
        ? progress.business_data 
        : {};
        
      updateObj.business_data = {
        ...baseBusinessData,
        ...updateObj.business_context,
        _deprecated: true // Marcar como deprecated para futura remoção
      };
    }
    
    console.log("[businessContextBuilder] Objeto de atualização gerado:", updateObj);
    return updateObj;
  } catch (error) {
    console.error("[businessContextBuilder] Erro ao construir objeto de atualização de Business Context:", error);
    return updateObj;
  }
}
