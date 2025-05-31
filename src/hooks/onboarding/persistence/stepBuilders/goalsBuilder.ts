
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Builder específico para dados de objetivos de negócio
 */
export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: Record<string, any> = {};
  
  console.log("Construindo objeto de atualização para Business Goals:", data);
  
  if (!data || !progress) {
    console.warn("Dados ou progresso não fornecidos para Business Goals Builder");
    return updateObj;
  }
  
  try {
    // Verificar se os dados vêm no formato aninhado ou direto
    const goalsData = data.business_goals || {};
    
    // Garantir que o objeto business_goals existe
    updateObj.business_goals = {
      ...(typeof progress.business_goals === 'object' ? progress.business_goals || {} : {}),
      ...goalsData,
      _last_updated: new Date().toISOString()
    };
    
    // Remover valores undefined que podem causar erro no Supabase
    Object.keys(updateObj.business_goals).forEach(key => {
      if (updateObj.business_goals[key] === undefined) {
        delete updateObj.business_goals[key];
      }
      
      // Garantir que arrays continuem sendo arrays
      if (Array.isArray(updateObj.business_goals[key]) && updateObj.business_goals[key].length === 0) {
        updateObj.business_goals[key] = [];
      }
    });
    
    console.log("Objeto de atualização gerado:", updateObj);
    return updateObj;
  } catch (error) {
    console.error("Erro ao construir objeto de atualização de Business Goals:", error);
    return updateObj;
  }
}
