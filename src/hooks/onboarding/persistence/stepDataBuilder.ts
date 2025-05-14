
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildBusinessContextUpdate } from "./businessContextBuilder";

/**
 * Constrói o objeto de atualização com base no ID da etapa e dados fornecidos
 */
export function buildUpdateObject(
  stepId: string, 
  data: any, 
  progress: OnboardingProgress | null, 
  currentStepIndex: number
): Record<string, any> {
  console.log(`[stepDataBuilder] Construindo objeto de atualização para etapa ${stepId}, índice ${currentStepIndex}`);

  if (!progress) {
    console.warn("[stepDataBuilder] Progresso não fornecido, usando objeto vazio");
    return {};
  }

  try {
    // Objeto base de atualização
    const updateObj: Record<string, any> = {};
    
    // Construir objeto específico com base no stepId
    switch(stepId) {
      case 'personal_info':
      case 'personal': {
        updateObj.personal_info = {
          ...(typeof progress.personal_info === 'object' ? progress.personal_info || {} : {}),
          ...data,
        };
        break;
      }
      
      case 'professional_info':
      case 'professional_data': {
        updateObj.professional_info = {
          ...(typeof progress.professional_info === 'object' ? progress.professional_info || {} : {}),
          ...data,
        };
        
        // Para compatibilidade, também atualizar campos legacy
        if (data.company_name) updateObj.company_name = data.company_name;
        if (data.company_size) updateObj.company_size = data.company_size;
        if (data.company_sector) updateObj.company_sector = data.company_sector;
        if (data.company_website) updateObj.company_website = data.company_website;
        if (data.current_position) updateObj.current_position = data.current_position;
        if (data.annual_revenue) updateObj.annual_revenue = data.annual_revenue;
        
        break;
      }
      
      case 'business_context': {
        // Usar builder especializado para business_context
        const businessContextUpdate = buildBusinessContextUpdate({ 
          [stepId]: data 
        }, progress);
        
        // Mesclar com o objeto de atualização principal
        Object.assign(updateObj, businessContextUpdate);
        break;
      }
      
      case 'ai_experience': {
        updateObj.ai_experience = {
          ...(typeof progress.ai_experience === 'object' ? progress.ai_experience || {} : {}),
          ...data,
        };
        break;
      }
      
      case 'business_goals': {
        updateObj.business_goals = {
          ...(typeof progress.business_goals === 'object' ? progress.business_goals || {} : {}),
          ...data,
        };
        break;
      }
      
      case 'experience_personalization': {
        updateObj.experience_personalization = {
          ...(typeof progress.experience_personalization === 'object' ? progress.experience_personalization || {} : {}),
          ...data,
        };
        break;
      }
      
      case 'complementary_info': {
        updateObj.complementary_info = {
          ...(typeof progress.complementary_info === 'object' ? progress.complementary_info || {} : {}),
          ...data,
        };
        
        // Para compatibilidade, também atualizar campos diretos
        if (data.how_found_us) updateObj.how_found_us = data.how_found_us;
        if (data.referred_by) updateObj.referred_by = data.referred_by;
        if (data.authorize_case_usage !== undefined) updateObj.authorize_case_usage = data.authorize_case_usage;
        if (data.interested_in_interview !== undefined) updateObj.interested_in_interview = data.interested_in_interview;
        if (data.priority_topics) updateObj.priority_topics = data.priority_topics;
        
        break;
      }
      
      default: {
        // Caso não seja uma etapa conhecida, apenas usar os dados como estão
        console.warn(`[stepDataBuilder] Etapa desconhecida: ${stepId}, usando dados diretamente`);
        Object.assign(updateObj, data);
      }
    }
    
    // Log do objeto final de atualização
    console.log(`[stepDataBuilder] Objeto de atualização construído para etapa ${stepId}:`, updateObj);
    
    return updateObj;
  } catch (error) {
    console.error(`[stepDataBuilder] Erro ao construir objeto de atualização para etapa ${stepId}:`, error);
    return {};
  }
}
