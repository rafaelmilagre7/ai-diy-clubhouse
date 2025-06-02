
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Builder específico para dados pessoais
 */
export function buildPersonalInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: Record<string, any> = {};
  
  if (!data || !progress) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Dados ou progresso não fornecidos para Personal Info Builder");
    }
    return updateObj;
  }
  
  try {
    // Verificar se os dados vêm no formato aninhado ou direto
    const personalData = data.personal_info || {};
    
    // Garantir que o objeto personal_info existe
    updateObj.personal_info = {
      ...(typeof progress.personal_info === 'object' ? progress.personal_info || {} : {}),
      ...personalData,
      _last_updated: new Date().toISOString()
    };
    
    // Remover valores undefined que podem causar erro no Supabase
    Object.keys(updateObj.personal_info).forEach(key => {
      if (updateObj.personal_info[key] === undefined) {
        delete updateObj.personal_info[key];
      }
    });
    
    return updateObj;
  } catch (error) {
    console.error("Erro ao construir objeto de atualização de Personal Info:", error);
    return updateObj;
  }
}
