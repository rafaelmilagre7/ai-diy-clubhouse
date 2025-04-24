
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildAIExperienceUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: Partial<OnboardingProgress> = {};
  
  // Verificar se os dados vieram no formato aninhado
  if (data.ai_experience) {
    updateObj.ai_experience = {
      ...progress?.ai_experience,
      ...data.ai_experience
    };
    
    // Garantir que arrays sejam tratados corretamente
    if (data.ai_experience.previous_tools) {
      if (!Array.isArray(data.ai_experience.previous_tools)) {
        updateObj.ai_experience.previous_tools = [data.ai_experience.previous_tools];
      }
    }
    
    if (data.ai_experience.desired_ai_areas) {
      if (!Array.isArray(data.ai_experience.desired_ai_areas)) {
        updateObj.ai_experience.desired_ai_areas = [data.ai_experience.desired_ai_areas];
      }
    }
  } 
  // Caso contrário, buscar campos relevantes diretamente
  else {
    const aiExperienceFields = [
      'knowledge_level',
      'previous_tools',
      'has_implemented',
      'desired_ai_areas',
      'completed_formation',
      'is_member_for_month',
      'nps_score',
      'improvement_suggestions'
    ];
    
    const aiExperienceData: any = {};
    let hasData = false;
    
    // Copiar campos relevantes
    aiExperienceFields.forEach(field => {
      if (field in data) {
        aiExperienceData[field] = data[field as keyof typeof data];
        hasData = true;
        
        // Garantir que arrays sejam tratados corretamente
        if ((field === 'previous_tools' || field === 'desired_ai_areas') && 
            aiExperienceData[field] && 
            typeof aiExperienceData[field] === 'string') {
          aiExperienceData[field] = [aiExperienceData[field]];
        }
      }
    });
    
    // Somente atualizar se tiver dados
    if (hasData) {
      updateObj.ai_experience = {
        ...progress?.ai_experience,
        ...aiExperienceData
      };
    }
  }
  
  return updateObj;
}

// Alias para compatibilidade com código existente
export const buildAiExperienceUpdate = buildAIExperienceUpdate;

