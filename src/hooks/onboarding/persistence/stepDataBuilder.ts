
import { steps } from "../useStepDefinitions";
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildUpdateObject(
  stepId: string,
  data: Partial<OnboardingData>,
  progress: OnboardingProgress | null,
  currentStepIndex: number
) {
  if (!progress) return {};

  const updateObj: any = {};

  // Log para debug
  console.log(`Construindo objeto de atualização para o passo ${stepId}`, data);

  // Dados específicos das etapas
  if (stepId === "personal") {
    updateObj.personal_info = data.personal_info || {};
  } else if (stepId === "professional_data") {
    // Garantir que os dados profissionais sejam salvos corretamente
    updateObj.professional_info = data.professional_info || {};
    
    // Compatibilidade: salvar também campos individuais para garantir
    // que os dados sejam acessíveis de ambas as formas
    if (data.professional_info) {
      updateObj.company_name = data.professional_info.company_name;
      updateObj.company_size = data.professional_info.company_size;
      updateObj.company_sector = data.professional_info.company_sector;
      updateObj.company_website = data.professional_info.company_website;
      updateObj.current_position = data.professional_info.current_position;
      updateObj.annual_revenue = data.professional_info.annual_revenue;
    }
  } else if (stepId === "business_context") {
    // Salvar dados de contexto de negócio
    if (data.business_context) {
      // Verificar se business_data existe no progress para evitar erros
      const existingBusinessData = progress.business_data || {};
      
      updateObj.business_data = {
        ...existingBusinessData,
        ...data.business_context
      };
      
      // Adicionar log detalhado para debugging
      console.log("Salvando business_context com valores:", {
        business_model: data.business_context.business_model,
        business_challenges: data.business_context.business_challenges?.length || 0,
        short_term_goals: data.business_context.short_term_goals?.length || 0,
        medium_term_goals: data.business_context.medium_term_goals?.length || 0,
        important_kpis: data.business_context.important_kpis?.length || 0,
        additional_context: data.business_context.additional_context?.length || 0,
      });
    } else {
      console.warn("business_context não encontrado nos dados enviados");
    }
  } else if (stepId === "ai_exp") {
    // Salvar dados de experiência com IA
    console.log("Construindo objeto de atualização para AI Experience:", data.ai_experience);

    if (data.ai_experience) {
      const existingAiExperience = progress.ai_experience || {};
      // Corrige para aceitar campo array desired_ai_areas e retrocompatibilidade
      let aiData = { ...existingAiExperience, ...data.ai_experience };
      
      // Corrigir se alguém enviou desired_ai_areas como string (legado)
      if (typeof aiData.desired_ai_areas === "string") {
        aiData.desired_ai_areas = [aiData.desired_ai_areas];
      }
      
      // Para compatibilidade com código legado que ainda possa usar desired_ai_area
      if (aiData.desired_ai_areas && !Array.isArray(aiData.desired_ai_areas)) {
        aiData.desired_ai_areas = [aiData.desired_ai_areas];
      }
      
      updateObj.ai_experience = aiData;
      console.log("Objeto final de AI Experience:", updateObj.ai_experience);
    } else {
      console.warn("ai_experience não encontrado nos dados enviados");
    }
  } else if (stepId === "business_goals") {
    // Salvar dados de objetivos de negócio
    const existingBusinessGoals = progress.business_goals || {};
    
    // Adicionar log para depuração do problema
    console.log("Dados de objetivos recebidos:", data.business_goals);
    console.log("Objetivos existentes:", existingBusinessGoals);
    
    if (data.business_goals) {
      // Garantir que o campo expected_outcomes seja sempre um array
      if (data.business_goals.expected_outcome_30days && !data.business_goals.expected_outcomes) {
        data.business_goals.expected_outcomes = [data.business_goals.expected_outcome_30days];
      }
      
      // Se temos apenas expected_outcomes mas não o campo individual, mantemos compatibilidade
      if (data.business_goals.expected_outcomes && data.business_goals.expected_outcomes.length > 0 && 
          !data.business_goals.expected_outcome_30days) {
        data.business_goals.expected_outcome_30days = data.business_goals.expected_outcomes[0];
      }
    }
    
    updateObj.business_goals = {
      ...existingBusinessGoals,
      ...(data.business_goals || {})
    };
    
    console.log("Salvando business_goals:", updateObj.business_goals);
  } else if (stepId === "experience_personalization") {
    // Salvar dados de personalização de experiência
    const existingExperiencePersonalization = progress.experience_personalization || {};
    updateObj.experience_personalization = {
      ...existingExperiencePersonalization,
      ...(data.experience_personalization || {})
    };
    console.log("Salvando experience_personalization:", updateObj.experience_personalization);
  } else if (stepId === "complementary_info") {
    // Salvar informações complementares
    if (progress.complementary_info) {
      updateObj.complementary_info = {
        ...progress.complementary_info,
        ...(data.complementary_info || {})
      };
    } else {
      updateObj.complementary_info = data.complementary_info || {};
    }
    console.log("Salvando complementary_info:", updateObj.complementary_info);
  } else if (stepId === "goals") {
    // Compatibilidade com etapa de objetivos antiga
    if (data.professional_info) {
      updateObj.professional_info = data.professional_info;
      
      // Compatibilidade dupla
      updateObj.company_name = data.professional_info.company_name;
      updateObj.company_size = data.professional_info.company_size;
      updateObj.company_sector = data.professional_info.company_sector;
      updateObj.company_website = data.professional_info.company_website;
      updateObj.current_position = data.professional_info.current_position;
      updateObj.annual_revenue = data.professional_info.annual_revenue;
    }
    console.log("Salvando dados profissionais (goals):", updateObj);
  } else {
    // Outras etapas (futuro)
    const sectionKey = steps.find(s => s.id === stepId)?.section as keyof OnboardingData;
    if (sectionKey && data[sectionKey]) {
      const existingData = progress[sectionKey as keyof OnboardingProgress] || {};
      if (typeof existingData === 'object') {
        updateObj[sectionKey] = {
          ...existingData,
          ...(data[sectionKey] as object)
        };
        console.log(`Salvando ${sectionKey}:`, data[sectionKey]);
      } else {
        // Se não for um objeto, simplesmente atribuir o valor
        updateObj[sectionKey] = data[sectionKey];
        console.log(`Salvando ${sectionKey} (valor direto):`, data[sectionKey]);
      }
    }
  }

  // Progresso: marcar etapa como concluída se ainda não estava
  if (!progress.completed_steps?.includes(stepId)) {
    updateObj.completed_steps = [...(progress.completed_steps || []), stepId];
  }

  // Atualiza current_step para a próxima etapa
  const isEditing = progress.completed_steps?.includes(stepId);
  
  // Definir próxima etapa de maneira mais confiável
  let nextStep = stepId;
  
  if (stepId === "personal") {
    nextStep = "professional_data";
  } else if (stepId === "professional_data") {
    nextStep = "business_context";
  } else if (stepId === "business_context") {
    nextStep = "ai_exp";
  } else if (stepId === "ai_exp") {
    nextStep = "business_goals";
  } else if (stepId === "business_goals") {
    nextStep = "experience_personalization";
  } else if (stepId === "experience_personalization") {
    nextStep = "complementary_info";
  } else if (stepId === "complementary_info") {
    nextStep = "review";
  } else if (stepId === "review") {
    nextStep = "completed";
  } else if (stepId === "goals") {
    // Compatibilidade com fluxo antigo
    nextStep = "business_context";
  } else {
    // Fallback para código anterior
    nextStep = steps[Math.min(currentStepIndex + 1, steps.length - 1)].id;
  }
  
  updateObj.current_step = nextStep;
  console.log(`Atualizando current_step para: ${nextStep}`);

  console.log("Objeto final para atualização:", updateObj);
  return updateObj;
}
