
import { OnboardingProgress } from "@/types/onboarding";

/**
 * Constrói o objeto de atualização com base no stepId e nos dados fornecidos
 */
export function buildUpdateObject(
  stepId: string, 
  data: any, 
  progress: OnboardingProgress | null, 
  currentStepIndex: number
): Partial<OnboardingProgress> {
  // Objeto de atualização base
  const updateObj: Partial<OnboardingProgress> = {};

  // Validar e tratar JSON circular
  const safeData = removeCircularReferences(data);
  
  // Inferir a seção com base no stepId
  const sectionKey = mapStepIdToSection(stepId);
  
  // Adicionar dados da seção ao objeto correspondente
  if (sectionKey) {
    updateObj[sectionKey] = safeData;
  }

  // Adicionar o stepId aos passos concluídos se ainda não estiver lá
  if (progress?.completed_steps) {
    // Evitar duplicatas convertendo para Set
    const completedStepsSet = new Set(progress.completed_steps);
    
    // Adicionar passo atual
    completedStepsSet.add(stepId);
    
    // Converter de volta para array
    updateObj.completed_steps = Array.from(completedStepsSet);
  } else {
    // Se não houver passos concluídos ainda, iniciar com o atual
    updateObj.completed_steps = [stepId];
  }

  // Outros metadados que podem ser úteis
  updateObj.updated_at = new Date().toISOString();
  
  // Remover campos técnicos ou inválidos
  cleanUpdateObject(updateObj);
  
  return updateObj;
}

/**
 * Remove referências circulares de um objeto JSON
 */
function removeCircularReferences(obj: any, cache = new WeakSet()): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (cache.has(obj)) {
    return undefined;
  }
  
  cache.add(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeCircularReferences(item, cache));
  }
  
  const result = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && typeof obj[key] !== 'function') {
      result[key] = removeCircularReferences(obj[key], cache);
    }
  });
  
  return result;
}

/**
 * Mapeia o ID da etapa para a seção do objeto de progresso
 */
function mapStepIdToSection(stepId: string): string {
  // Mapeamento de IDs de etapa para seções do objeto de progresso
  const stepToSectionMap = {
    'personal': 'personal_info',
    'personal_info': 'personal_info',
    'professional_data': 'professional_info',
    'professional_info': 'professional_info',
    'business_context': 'business_context',
    'ai_exp': 'ai_experience',
    'ai_experience': 'ai_experience',
    'business_goals': 'business_goals',
    'experience_personalization': 'experience_personalization',
    'complementary_info': 'complementary_info',
    'complementary': 'complementary_info',
    'formation_data': 'formation_data'
  };
  
  // Retornar seção mapeada ou o próprio stepId se não houver mapeamento
  return stepToSectionMap[stepId as keyof typeof stepToSectionMap] || stepId;
}

/**
 * Limpa o objeto de atualização removendo campos problemáticos
 */
function cleanUpdateObject(updateObj: Partial<OnboardingProgress>): void {
  // Remover campos que não devem ser enviados para atualização
  delete (updateObj as any)._metadata;
  delete (updateObj as any)._last_updated;
  
  // Remover campos que podem causar problemas em objetos aninhados
  Object.keys(updateObj).forEach(key => {
    if (
      typeof updateObj[key as keyof typeof updateObj] === 'object' &&
      updateObj[key as keyof typeof updateObj] !== null
    ) {
      const objField = updateObj[key as keyof typeof updateObj] as any;
      delete objField?._metadata;
      delete objField?._last_updated;
    }
  });
}
