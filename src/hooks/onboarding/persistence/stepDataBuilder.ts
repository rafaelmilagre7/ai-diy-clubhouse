
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { buildBusinessContextUpdate } from "./businessContextBuilder";
import { buildProfessionalDataUpdate } from "./stepBuilders/professionalDataBuilder";
import { buildAiExpUpdate } from "./stepBuilders/aiExpBuilder";
import { buildPersonalUpdate } from "./stepBuilders/personalBuilder";

// Nova função para processar dados de objetivos de negócio
function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("Construindo objeto de atualização para Business Goals:", data);
  
  if (data.business_goals) {
    // Se recebemos um objeto aninhado
    const goalsData = data.business_goals;
    const existingGoals = progress?.business_goals || {};
    
    // Se existingGoals for uma string, inicialize como objeto vazio
    const baseGoals = typeof existingGoals === 'string' ? {} : existingGoals;
    
    // Processamento de arrays
    let formattedData = { ...goalsData };
    
    // Garantir que arrays sejam preservados
    ['expected_outcomes', 'content_formats'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.business_goals = {
      ...baseGoals,
      ...formattedData
    };
  } else if (typeof data === 'object' && data !== null) {
    // Dados enviados diretamente
    const existingGoals = progress?.business_goals || {};
    
    // Se existingGoals for uma string, inicialize como objeto vazio
    const baseGoals = typeof existingGoals === 'string' ? {} : existingGoals;
    
    // Processamento de arrays
    let formattedData = { ...data };
    
    // Garantir que arrays sejam preservados
    ['expected_outcomes', 'content_formats'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.business_goals = {
      ...baseGoals,
      ...formattedData
    };
  }
  
  return updateObj;
}

// Nova função para processar personalização de experiência
function buildExperiencePersonalizationUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("Construindo objeto de atualização para Experience Personalization:", data);
  
  if (data.experience_personalization) {
    // Se recebemos um objeto aninhado
    const personalizationData = data.experience_personalization;
    const existingPersonalization = progress?.experience_personalization || {};
    
    // Se existingPersonalization for uma string, inicialize como objeto vazio
    const basePersonalization = typeof existingPersonalization === 'string' ? {} : existingPersonalization;
    
    // Processamento de arrays
    let formattedData = { ...personalizationData };
    
    // Garantir que arrays sejam preservados
    ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.experience_personalization = {
      ...basePersonalization,
      ...formattedData
    };
  } else if (typeof data === 'object' && data !== null) {
    // Dados enviados diretamente
    const existingPersonalization = progress?.experience_personalization || {};
    
    // Se existingPersonalization for uma string, inicialize como objeto vazio
    const basePersonalization = typeof existingPersonalization === 'string' ? {} : existingPersonalization;
    
    // Processamento de arrays
    let formattedData = { ...data };
    
    // Garantir que arrays sejam preservados
    ['interests', 'time_preference', 'available_days', 'skills_to_share', 'mentorship_topics'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.experience_personalization = {
      ...basePersonalization,
      ...formattedData
    };
  }
  
  return updateObj;
}

// Nova função para processar informações complementares
function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("Construindo objeto de atualização para Complementary Info:", data);
  
  if (data.complementary_info) {
    // Se recebemos um objeto aninhado
    const complementaryData = data.complementary_info;
    const existingComplementary = progress?.complementary_info || {};
    
    // Se existingComplementary for uma string, inicialize como objeto vazio
    const baseComplementary = typeof existingComplementary === 'string' ? {} : existingComplementary;
    
    // Processamento de arrays
    let formattedData = { ...complementaryData };
    
    // Garantir que arrays sejam preservados
    ['priority_topics'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.complementary_info = {
      ...baseComplementary,
      ...formattedData
    };
  } else if (typeof data === 'object' && data !== null) {
    // Dados enviados diretamente
    const existingComplementary = progress?.complementary_info || {};
    
    // Se existingComplementary for uma string, inicialize como objeto vazio
    const baseComplementary = typeof existingComplementary === 'string' ? {} : existingComplementary;
    
    // Processamento de arrays
    let formattedData = { ...data };
    
    // Garantir que arrays sejam preservados
    ['priority_topics'].forEach(field => {
      if (formattedData[field] && !Array.isArray(formattedData[field])) {
        formattedData[field] = [formattedData[field]];
      }
    });
    
    updateObj.complementary_info = {
      ...baseComplementary,
      ...formattedData
    };
  }
  
  return updateObj;
}

// Função principal buildUpdateObject que será usada pelos outros arquivos
export function buildUpdateObject(
  stepId: string, 
  data: any, 
  progress: OnboardingProgress | null, 
  currentStepIndex: number
) {
  console.log(`Construindo objeto de atualização para passo ${stepId}`, data);
  
  // Objeto base para atualização
  const updateObj: any = {};
  
  // Processar dados com base no ID da etapa
  switch (stepId) {
    case "personal":
      // Dados pessoais usando o builder específico
      console.log("Processando dados pessoais:", data);
      const personalUpdates = buildPersonalUpdate(data, progress);
      Object.assign(updateObj, personalUpdates);
      break;
      
    case "professional_data":
      // Usar a função específica para dados profissionais
      console.log("Processando dados profissionais:", data);
      const professionalUpdates = buildProfessionalDataUpdate(data, progress);
      Object.assign(updateObj, professionalUpdates);
      break;
      
    case "business_context":
      // Dados de contexto de negócio - usar builder específico
      console.log("Processando dados de contexto de negócio:", data);
      const businessContextUpdates = buildBusinessContextUpdate(data, progress);
      Object.assign(updateObj, businessContextUpdates);
      break;
      
    case "ai_exp":
      // Experiência com IA - usar builder específico
      console.log("Processando dados de experiência com IA:", data);
      const aiExpUpdates = buildAiExpUpdate(data, progress);
      Object.assign(updateObj, aiExpUpdates);
      break;
      
    case "business_goals":
      // Objetivos de negócio - usar builder específico
      console.log("Processando dados de objetivos de negócio:", data);
      const businessGoalsUpdates = buildBusinessGoalsUpdate(data, progress);
      Object.assign(updateObj, businessGoalsUpdates);
      break;
      
    case "experience_personalization":
      // Personalização de experiência - usar builder específico
      console.log("Processando dados de personalização:", data);
      const personalizationUpdates = buildExperiencePersonalizationUpdate(data, progress);
      Object.assign(updateObj, personalizationUpdates);
      break;
      
    case "complementary_info":
      // Informações complementares - usar builder específico
      console.log("Processando informações complementares:", data);
      const complementaryUpdates = buildComplementaryInfoUpdate(data, progress);
      Object.assign(updateObj, complementaryUpdates);
      break;
      
    default:
      console.warn(`Passo não reconhecido: ${stepId}. Dados não processados.`);
  }

  // Atualizar campo completed_steps para incluir a etapa atual, se ainda não estiver incluída
  if (progress && progress.completed_steps) {
    const stepsCompleted = [...progress.completed_steps];
    if (!stepsCompleted.includes(stepId)) {
      stepsCompleted.push(stepId);
      updateObj.completed_steps = stepsCompleted;
      console.log(`Adicionando ${stepId} aos passos completados:`, stepsCompleted);
    }
  } else {
    updateObj.completed_steps = [stepId];
    console.log(`Iniciando passos completados com ${stepId}`);
  }

  // Definir a etapa atual como a próxima após a conclusão
  if (typeof currentStepIndex === 'number') {
    const nextIndex = currentStepIndex + 1;
    const steps = [
      "personal", 
      "professional_data", 
      "business_context", 
      "ai_exp", 
      "business_goals", 
      "experience_personalization", 
      "complementary_info", 
      "review"
    ];
    
    if (nextIndex < steps.length) {
      updateObj.current_step = steps[nextIndex];
      console.log(`Atualizando passo atual para: ${steps[nextIndex]}`);
    }
  }

  // Log detalhado do objeto de atualização final
  console.log("Objeto de atualização final a ser enviado para o Supabase:", updateObj);
  return updateObj;
}
