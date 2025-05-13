
import { OnboardingData, OnboardingProgress } from '@/types/onboarding';
import { buildPersonalInfoUpdate } from './stepBuilders/personalInfoBuilder';

export function buildUpdateObject(
  stepId: string,
  data: Partial<OnboardingData> | any,
  progress: OnboardingProgress | null | undefined,
  currentStepIndex: number | undefined
): any {
  console.log(`Building update object for step ${stepId}`);
  
  // Se não tivermos um progresso, não podemos atualizar nada
  if (!progress) {
    console.warn('Nenhum progresso encontrado para atualizar');
    return {};
  }

  // Determinar o tipo de onboarding (padrão é 'club')
  const onboardingType = progress.onboarding_type || 'club';
  
  // Base do objeto de atualização
  const updateObj: any = {};
  
  // Adicionar IDs de etapas concluídas
  if (stepId) {
    const completedSteps = progress.completed_steps || [];
    if (!completedSteps.includes(stepId)) {
      updateObj.completed_steps = [...completedSteps, stepId];
    }
  }

  // Comportamento específico para cada tipo de etapa
  switch (stepId) {
    case 'personal':
    case 'personal_info':
      return {
        ...updateObj,
        ...buildPersonalInfoUpdate(data, progress)
      };
    
    case 'professional_data':
    case 'professional_info':
      if (data.professional_info || data.company_name) {
        updateObj.professional_info = {
          ...(progress.professional_info || {}),
          ...(data.professional_info || data)
        };
        
        // Compatibilidade com campos legacy
        updateObj.company_name = data.company_name || data.professional_info?.company_name || progress.company_name;
        updateObj.company_size = data.company_size || data.professional_info?.company_size || progress.company_size;
        updateObj.company_sector = data.company_sector || data.professional_info?.company_sector || progress.company_sector;
        updateObj.company_website = data.company_website || data.professional_info?.company_website || progress.company_website;
        updateObj.current_position = data.current_position || data.professional_info?.current_position || progress.current_position;
        updateObj.annual_revenue = data.annual_revenue || data.professional_info?.annual_revenue || progress.annual_revenue;
      }
      return updateObj;
    
    case 'business_context':
      if (data.business_context) {
        updateObj.business_context = {
          ...(progress.business_context || {}),
          ...data.business_context
        };
      }
      return updateObj;
    
    case 'ai_exp':
      if (data.ai_experience) {
        updateObj.ai_experience = {
          ...(progress.ai_experience || {}),
          ...data.ai_experience
        };
      }
      return updateObj;
    
    case 'business_goals':
      if (data.business_goals) {
        updateObj.business_goals = {
          ...(progress.business_goals || {}),
          ...data.business_goals
        };
      }
      return updateObj;
    
    case 'experience_personalization':
      if (data.experience_personalization) {
        updateObj.experience_personalization = {
          ...(progress.experience_personalization || {}),
          ...data.experience_personalization
        };
      }
      return updateObj;
    
    case 'complementary_info':
      if (data.complementary_info) {
        updateObj.complementary_info = {
          ...(progress.complementary_info || {}),
          ...data.complementary_info
        };
      }
      return updateObj;
      
    // Novas etapas para formação
    case 'formation_goals':
    case 'learning_preferences':
      if (data.formation_data) {
        updateObj.formation_data = {
          ...(progress.formation_data || {}),
          ...data.formation_data
        };
      } else {
        // Caso os dados venham diretamente e não dentro de formation_data
        updateObj.formation_data = {
          ...(progress.formation_data || {}),
          ...data
        };
      }
      
      // Sempre garantir que o tipo de onboarding esteja definido
      updateObj.onboarding_type = 'formacao';
      return updateObj;
    
    default:
      console.warn(`Tipo de etapa desconhecido: ${stepId}`);
      
      // Se não for uma etapa conhecida, tenta salvar os dados diretamente
      if (typeof data === 'object' && data !== null) {
        return { ...updateObj, ...data };
      }
      
      return updateObj;
  }
}
