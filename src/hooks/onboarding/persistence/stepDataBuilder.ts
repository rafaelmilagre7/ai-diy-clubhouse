
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
    updateObj.business_context = data.business_context || {};
    console.log("Salvando business_context:", updateObj.business_context);
  } else if (stepId === "ai_exp") {
    // Salvar dados de experiência com IA
    updateObj.ai_experience = data.ai_experience || {};
    console.log("Salvando ai_experience:", updateObj.ai_experience);
  } else if (stepId === "business_goals") {
    // Salvar dados de objetivos de negócio
    updateObj.business_goals = data.business_goals || {};
    console.log("Salvando business_goals:", updateObj.business_goals);
  } else if (stepId === "experience_personalization") {
    // Salvar dados de personalização de experiência
    updateObj.experience_personalization = data.experience_personalization || {};
    console.log("Salvando experience_personalization:", updateObj.experience_personalization);
  } else if (stepId === "complementary_info") {
    // Salvar informações complementares
    updateObj.complementary_info = data.complementary_info || {};
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
      updateObj[sectionKey] = data[sectionKey];
      console.log(`Salvando ${sectionKey}:`, data[sectionKey]);
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
