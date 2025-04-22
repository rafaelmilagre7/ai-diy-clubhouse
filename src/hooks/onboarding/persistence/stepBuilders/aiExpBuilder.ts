
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";

export function buildAiExpUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Normalizar arrays se necessário
  if (data.ai_experience) {
    const aiExp = data.ai_experience;
    
    // Verificar que arrays específicos são realmente arrays
    if (aiExp.desired_ai_areas && !Array.isArray(aiExp.desired_ai_areas)) {
      aiExp.desired_ai_areas = [aiExp.desired_ai_areas];
    }
    
    if (aiExp.previous_tools && !Array.isArray(aiExp.previous_tools)) {
      aiExp.previous_tools = [aiExp.previous_tools];
    }
  }
  
  // Usar o builder base para construir o objeto de atualização
  return buildBaseUpdate("ai_experience", data, progress, {
    topLevelFields: ["ai_knowledge_level"]
  });
}
