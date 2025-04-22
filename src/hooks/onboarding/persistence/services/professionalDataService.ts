
import { supabase } from "@/lib/supabase";
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { normalizeWebsite } from "../utils/dataNormalization";

/**
 * Salva os dados profissionais no novo esquema de banco de dados
 */
export async function saveProfessionalData(
  progressId: string, 
  userId: string, 
  data: Partial<OnboardingData> | ProfessionalDataInput
) {
  if (!progressId || !userId) {
    console.error("ID de progresso ou ID de usuário não fornecido");
    throw new Error("Dados incompletos para salvar informações profissionais");
  }

  // Obter dados profissionais (seja de data.professional_info ou diretamente de data)
  const profData = 'professional_info' in data && data.professional_info 
    ? data.professional_info 
    : data as ProfessionalDataInput;
  
  // Formatar dados
  const professionalData = {
    progress_id: progressId,
    user_id: userId,
    company_name: profData.company_name || null,
    company_size: profData.company_size || null,
    company_sector: profData.company_sector || null,
    company_website: profData.company_website ? normalizeWebsite(profData.company_website) : null,
    current_position: profData.current_position || null,
    annual_revenue: profData.annual_revenue || null
  };
  
  // Verificar se já existe um registro
  const { data: existingData, error: queryError } = await supabase
    .from("onboarding_professional_info")
    .select("id")
    .eq("progress_id", progressId)
    .maybeSingle();
    
  if (queryError) {
    console.error("Erro ao verificar dados profissionais existentes:", queryError);
    throw queryError;
  }
  
  // Atualizar ou inserir dependendo se já existe
  if (existingData?.id) {
    console.log("Atualizando dados profissionais existentes:", professionalData);
    const { data, error } = await supabase
      .from("onboarding_professional_info")
      .update(professionalData)
      .eq("id", existingData.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } else {
    console.log("Inserindo novos dados profissionais:", professionalData);
    const { data, error } = await supabase
      .from("onboarding_professional_info")
      .insert(professionalData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

/**
 * Busca os dados profissionais do novo esquema de banco de dados
 */
export async function fetchProfessionalData(progressId: string) {
  if (!progressId) {
    console.error("ID de progresso não fornecido");
    throw new Error("ID de progresso obrigatório para buscar dados profissionais");
  }
  
  const { data, error } = await supabase
    .from("onboarding_professional_info")
    .select("*")
    .eq("progress_id", progressId)
    .maybeSingle();
    
  if (error) {
    console.error("Erro ao buscar dados profissionais:", error);
    throw error;
  }
  
  return data;
}

/**
 * Formata os dados profissionais para o formato esperado pela aplicação
 */
export function formatProfessionalData(data: any): Partial<OnboardingProgress> {
  if (!data) return { professional_info: {} };
  
  const professionalInfo = {
    company_name: data.company_name || "",
    company_size: data.company_size || "",
    company_sector: data.company_sector || "",
    company_website: data.company_website || "",
    current_position: data.current_position || "",
    annual_revenue: data.annual_revenue || ""
  };
  
  return {
    professional_info: professionalInfo,
    company_name: data.company_name || "",
    company_size: data.company_size || "",
    company_sector: data.company_sector || "",
    company_website: data.company_website || "",
    current_position: data.current_position || "",
    annual_revenue: data.annual_revenue || ""
  };
}
