
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildAiExpUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("Construindo objeto de atualização para AI Experience:", data);
  
  // Verificar se os dados vêm no formato aninhado ou direto
  if (data.ai_experience) {
    // Formato aninhado: { ai_experience: { ... } }
    const aiExpData = data.ai_experience;
    const existingAiExp = progress?.ai_experience || {};
    
    // Se existingAiExp for uma string, inicialize como objeto vazio
    const baseAiExp = typeof existingAiExp === 'string' ? {} : existingAiExp;
    
    // Garantir que desired_ai_areas seja sempre um array
    let updatedData = { ...baseAiExp, ...aiExpData };
    
    // Garantir que desired_ai_areas seja um array
    if (updatedData.desired_ai_areas && !Array.isArray(updatedData.desired_ai_areas)) {
      updatedData.desired_ai_areas = [updatedData.desired_ai_areas];
    }
    
    // Salvar dados atualizados
    updateObj.ai_experience = updatedData;
    
    // Log detalhado
    console.log("Dados de experiência AI formatados:", updatedData);
  } else if (typeof data === 'object' && data !== null) {
    // Formato direto: dados enviados diretamente
    const existingAiExp = progress?.ai_experience || {};
    
    // Se existingAiExp for uma string, inicialize como objeto vazio
    const baseAiExp = typeof existingAiExp === 'string' ? {} : existingAiExp;
    
    let updatedData = { ...baseAiExp, ...data };
    
    // Garantir que desired_ai_areas seja um array
    if (updatedData.desired_ai_areas && !Array.isArray(updatedData.desired_ai_areas)) {
      updatedData.desired_ai_areas = [updatedData.desired_ai_areas];
    }
    
    updateObj.ai_experience = updatedData;
    
    // Log detalhado
    console.log("Dados de experiência AI formatados (formato direto):", updatedData);
  }
  
  return updateObj;
}
