import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { buildBusinessContextUpdate } from "./businessContextBuilder";

export function buildProfessionalDataUpdate(
  data: ProfessionalDataInput, 
  progress: OnboardingProgress | null
) {
  const updateObj: any = {};
  
  console.log("Construindo dados profissionais para salvar:", data);

  // Dados profissionais
  const professionalInfo = {
    company_name: data.company_name || data.professional_info?.company_name || "",
    company_size: data.company_size || data.professional_info?.company_size || "",
    company_sector: data.company_sector || data.professional_info?.company_sector || "",
    company_website: data.company_website || data.professional_info?.company_website || "",
    current_position: data.current_position || data.professional_info?.current_position || "",
    annual_revenue: data.annual_revenue || data.professional_info?.annual_revenue || "",
  };

  // Log detalhado dos dados
  console.log("Dados profissionais normalizados:", professionalInfo);

  // Adicionar dados ao objeto de atualização
  updateObj.professional_info = professionalInfo;
  
  // Adicionar campos de nível superior para compatibilidade
  updateObj.company_name = professionalInfo.company_name;
  updateObj.company_size = professionalInfo.company_size;
  updateObj.company_sector = professionalInfo.company_sector;
  updateObj.company_website = professionalInfo.company_website;
  updateObj.current_position = professionalInfo.current_position;
  updateObj.annual_revenue = professionalInfo.annual_revenue;

  // Validações adicionais
  if (!updateObj.company_name) {
    console.warn("Nome da empresa não foi preenchido");
  }

  return updateObj;
}

// Nova função buildUpdateObject que será usada pelos outros arquivos
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
      // Dados pessoais
      console.log("Processando dados pessoais:", data);
      if (data && Object.keys(data).length > 0) {
        updateObj.personal_info = data;
      }
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
      // Experiência com IA
      console.log("Processando dados de experiência com IA:", data);
      if (data && Object.keys(data).length > 0) {
        updateObj.ai_experience = data;
      }
      break;
      
    case "business_goals":
      // Objetivos de negócio
      console.log("Processando dados de objetivos de negócio:", data);
      if (data && Object.keys(data).length > 0) {
        updateObj.business_goals = data;
      }
      break;
      
    case "experience_personalization":
      // Personalização de experiência
      console.log("Processando dados de personalização:", data);
      if (data && Object.keys(data).length > 0) {
        updateObj.experience_personalization = data;
      }
      break;
      
    case "complementary_info":
      // Informações complementares
      console.log("Processando informações complementares:", data);
      if (data && Object.keys(data).length > 0) {
        updateObj.complementary_info = data;
      }
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
