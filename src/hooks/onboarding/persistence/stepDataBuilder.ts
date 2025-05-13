
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";

/**
 * Constrói o objeto de atualização para qualquer etapa do onboarding
 * Versão melhorada para melhor tratamento de estruturas de dados aninhadas
 */
export function buildUpdateObject(
  stepId: string, 
  data: Partial<OnboardingData>, 
  progress: OnboardingProgress | null,
  currentStepIndex: number
) {
  // Sempre iniciar com um objeto vazio para acumular atualizações
  const updateObj: Record<string, any> = {};
  
  // Adicionar o current_step ao objeto de atualização
  updateObj.current_step = stepId;
  
  // Se temos progresso existente, obter completed_steps ou iniciar array vazio
  const completedSteps = progress?.completed_steps || [];
  
  // Verificar se o passo atual já está marcado como completo
  if (!completedSteps.includes(stepId)) {
    // Adicionar o passo atual aos passos concluídos
    updateObj.completed_steps = [...completedSteps, stepId];
  } else {
    // Manter os passos concluídos como estão
    updateObj.completed_steps = completedSteps;
  }
  
  // Lidar com os dados específicos de cada etapa
  switch (stepId) {
    case 'personal':
    case 'personal_info':
      // Dados pessoais
      if ('personal_info' in data) {
        updateObj.personal_info = data.personal_info;
      }
      break;
      
    case 'professional_data':
    case 'professional_info':
      // Usar builder especializado para dados profissionais
      const professionalInfoUpdates = buildProfessionalDataUpdate(data, progress);
      Object.assign(updateObj, professionalInfoUpdates);
      break;
      
    case 'business_context':
      if ('business_context' in data) {
        updateObj.business_context = data.business_context;
      }
      break;
      
    case 'ai_exp':
    case 'ai_experience':
      if ('ai_experience' in data) {
        updateObj.ai_experience = data.ai_experience;
      }
      break;
      
    case 'business_goals':
      if ('business_goals' in data) {
        updateObj.business_goals = data.business_goals;
      }
      break;
      
    case 'experience_personalization':
      if ('experience_personalization' in data) {
        updateObj.experience_personalization = data.experience_personalization;
      }
      break;
      
    case 'complementary_info':
      if ('complementary_info' in data) {
        updateObj.complementary_info = data.complementary_info;
      }
      // Campos específicos para complementary_info
      if ('how_found_us' in data) updateObj.how_found_us = data.how_found_us;
      if ('referred_by' in data) updateObj.referred_by = data.referred_by;
      if ('authorize_case_usage' in data) updateObj.authorize_case_usage = data.authorize_case_usage;
      if ('interested_in_interview' in data) updateObj.interested_in_interview = data.interested_in_interview;
      if ('priority_topics' in data) updateObj.priority_topics = data.priority_topics;
      break;
      
    default:
      // Para outros passos, apenas copiar os dados diretamente
      console.log(`Processando passo sem handler específico: ${stepId}`);
      Object.assign(updateObj, data);
  }
  
  console.log(`Objeto de atualização construído para passo ${stepId}:`, updateObj);
  return updateObj;
}
