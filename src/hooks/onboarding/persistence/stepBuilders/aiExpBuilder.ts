
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Builder específico para dados de experiência com IA
 * Processa e normaliza os dados para garantir consistência no armazenamento
 */
export function buildAiExpUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Log para debug dos dados recebidos
  console.log("Dados recebidos no aiExpBuilder:", data);
  
  // Extrair os dados de ai_experience do objeto fornecido
  let aiExperienceData: any = null;
  
  // Verificar se os dados já estão dentro de um objeto ai_experience
  if (data.ai_experience) {
    aiExperienceData = data.ai_experience;
  } 
  // Verificar se há uma propriedade ai_exp que pode conter os dados
  else if (data.ai_exp) {
    aiExperienceData = data.ai_exp;
  }
  // Se ai_experience não existe, verificar se existe alguma propriedade aninhada chamada ai_experience
  else if (data.ai_experience === undefined) {
    // Verificar se há alguma outra propriedade que possa conter ai_experience
    for (const key in data) {
      const value = data[key as keyof typeof data];
      if (value && typeof value === 'object' && ('ai_experience' in value || 'ai_exp' in value)) {
        aiExperienceData = 'ai_experience' in value ? 
                          (value as any).ai_experience : 
                          (value as any).ai_exp;
        break;
      }
    }
  }
  
  // Se ainda não temos dados, tentar encontrar de outra forma
  if (!aiExperienceData && typeof data === 'object') {
    // Tentar encontrar em outras propriedades comuns
    for (const key in data) {
      const value = data[key as keyof typeof data];
      if (
        value && 
        typeof value === 'object' && 
        (
          'knowledge_level' in value || 
          'previous_tools' in value || 
          'has_implemented' in value ||
          'desired_ai_areas' in value
        )
      ) {
        aiExperienceData = value;
        break;
      }
    }
  }
  
  // Se ainda não encontramos, usar um objeto vazio
  if (!aiExperienceData) {
    console.warn("Não foi possível encontrar dados de experiência com IA, usando objeto vazio");
    aiExperienceData = {};
  }
  
  // Converter para string e depois para objeto, se necessário
  if (typeof aiExperienceData === 'string') {
    try {
      aiExperienceData = JSON.parse(aiExperienceData);
      console.log("Convertido aiExperienceData de string para objeto:", aiExperienceData);
    } catch (e) {
      console.error("Erro ao converter aiExperienceData de string para objeto:", e);
      aiExperienceData = {};
    }
  }
  
  // Garantir que aiExperienceData é um objeto
  if (!aiExperienceData || typeof aiExperienceData !== 'object') {
    aiExperienceData = {};
  }
  
  // Normalizar arrays
  const normalizedData: Record<string, any> = { ...aiExperienceData };
  
  // Garantir que previous_tools é um array
  if (normalizedData.previous_tools && !Array.isArray(normalizedData.previous_tools)) {
    normalizedData.previous_tools = [normalizedData.previous_tools];
  } else if (!normalizedData.previous_tools) {
    normalizedData.previous_tools = [];
  }
  
  // Garantir que desired_ai_areas é um array
  if (normalizedData.desired_ai_areas && !Array.isArray(normalizedData.desired_ai_areas)) {
    normalizedData.desired_ai_areas = [normalizedData.desired_ai_areas];
  } else if (!normalizedData.desired_ai_areas) {
    normalizedData.desired_ai_areas = [];
  }
  
  // Normalizar has_implemented para um formato consistente
  if (normalizedData.has_implemented !== undefined) {
    if (typeof normalizedData.has_implemented === 'string') {
      normalizedData.has_implemented = 
        (normalizedData.has_implemented.toLowerCase() === 'sim' || 
         normalizedData.has_implemented.toLowerCase() === 'yes' || 
         normalizedData.has_implemented === '1' || 
         normalizedData.has_implemented.toLowerCase() === 'true') ? 'sim' : 'nao';
    } else if (typeof normalizedData.has_implemented === 'boolean') {
      normalizedData.has_implemented = normalizedData.has_implemented ? 'sim' : 'nao';
    }
  }
  
  // Garantir que os campos booleanos estão no formato correto
  if (typeof normalizedData.completed_formation !== 'boolean') {
    normalizedData.completed_formation = normalizedData.completed_formation === true || 
      normalizedData.completed_formation === 'true' || 
      normalizedData.completed_formation === 'sim' || 
      normalizedData.completed_formation === '1';
  }
  
  if (typeof normalizedData.is_member_for_month !== 'boolean') {
    normalizedData.is_member_for_month = normalizedData.is_member_for_month === true || 
      normalizedData.is_member_for_month === 'true' || 
      normalizedData.is_member_for_month === 'sim' || 
      normalizedData.is_member_for_month === '1';
  }
  
  // Garantir que nps_score é um número
  if (normalizedData.nps_score !== undefined && typeof normalizedData.nps_score !== 'number') {
    normalizedData.nps_score = parseInt(normalizedData.nps_score, 10) || 5;
  }
  
  // Garantir que o nível de conhecimento seja um dos valores esperados
  if (normalizedData.knowledge_level && typeof normalizedData.knowledge_level === 'string') {
    const validLevels = ['iniciante', 'basico', 'intermediario', 'avancado', 'especialista'];
    if (!validLevels.includes(normalizedData.knowledge_level.toLowerCase())) {
      normalizedData.knowledge_level = 'iniciante';
    }
  }
  
  // Criar o objeto finalizado para ai_experience
  const finalAiExpData = {
    ...normalizedData,
    _last_updated: new Date().toISOString()
  };
  
  // Log dos dados processados
  console.log("Dados de AI Experience normalizados:", finalAiExpData);
  
  // Construir objeto de atualização
  const updateObj: any = {};
  updateObj.ai_experience = finalAiExpData;
  
  return updateObj;
}
