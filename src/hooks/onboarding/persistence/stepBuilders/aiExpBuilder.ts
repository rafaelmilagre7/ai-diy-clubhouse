
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";

/**
 * Builder específico para dados de experiência com IA
 * Processa e normaliza os dados para facilitar interpretação por IA
 */
export function buildAiExpUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Criar cópia dos dados para processamento
  const processedData = { ...data };
  
  // Normalizar arrays se necessário
  if (processedData.ai_experience) {
    const aiExp = processedData.ai_experience;
    
    // Verificar que arrays específicos são realmente arrays
    if (aiExp.desired_ai_areas && !Array.isArray(aiExp.desired_ai_areas)) {
      aiExp.desired_ai_areas = [aiExp.desired_ai_areas];
    }
    
    if (aiExp.previous_tools && !Array.isArray(aiExp.previous_tools)) {
      aiExp.previous_tools = [aiExp.previous_tools];
    }
    
    // Converter valores de string para booleanos quando apropriado
    if (aiExp.has_implemented !== undefined) {
      if (typeof aiExp.has_implemented === 'string') {
        // Armazenar como string 'true' ou 'false' em vez de booleano
        aiExp.has_implemented = 
          (aiExp.has_implemented.toLowerCase() === 'sim' || 
          aiExp.has_implemented.toLowerCase() === 'yes' || 
          aiExp.has_implemented === '1' || 
          aiExp.has_implemented.toLowerCase() === 'true') ? 'true' : 'false';
      } else if (typeof aiExp.has_implemented === 'boolean') {
        // Converter booleano para string
        aiExp.has_implemented = aiExp.has_implemented ? 'true' : 'false';
      }
    }
    
    // Garantir que o nível de conhecimento seja um dos valores esperados
    if (aiExp.knowledge_level && typeof aiExp.knowledge_level === 'string') {
      const validLevels = ['iniciante', 'intermediário', 'avançado'];
      if (!validLevels.includes(aiExp.knowledge_level.toLowerCase())) {
        aiExp.knowledge_level = 'iniciante';
      }
    }
  }
  
  // Adicionar metadados semânticos para facilitar interpretação por IA
  const semanticMetadata = {
    data_type: "ai_experience",
    data_context: "technology_experience",
    data_version: "1.0",
    timestamp: new Date().toISOString()
  };
  
  // Usar o builder base para construir o objeto de atualização
  return buildBaseUpdate("ai_experience", processedData, progress, {
    topLevelFields: ["ai_knowledge_level"],
    metadata: semanticMetadata
  });
}
