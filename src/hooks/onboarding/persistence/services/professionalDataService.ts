
import { supabase } from "@/lib/supabase";
import { normalizeField } from "../utils/dataNormalization";
import { ProfessionalDataInput } from "@/types/onboarding";

/**
 * Salva os dados profissionais na tabela específica
 */
export const saveProfessionalData = async (
  progressId: string,
  userId: string,
  data: Partial<ProfessionalDataInput> | { professional_info?: any }
) => {
  try {
    console.log("Salvando dados profissionais:", { progressId, userId, data });
    
    // Extrair os dados profissionais do objeto, seja de dados diretos ou de professional_info
    let professionalData: any = {};
    
    if ('professional_info' in data && data.professional_info) {
      professionalData = data.professional_info;
    } else {
      professionalData = data;
    }
    
    // Garantir que os campos estão preenchidos
    const companyName = professionalData.company_name || "";
    const companySize = professionalData.company_size || "";
    const companySector = professionalData.company_sector || "";
    const companyWebsite = professionalData.company_website || "";
    const currentPosition = professionalData.current_position || "";
    const annualRevenue = professionalData.annual_revenue || "";
    
    // Criar objeto consolidado para atualização
    const updateData = {
      professional_info: {
        company_name: companyName,
        company_size: companySize,
        company_sector: companySector,
        company_website: companyWebsite,
        current_position: currentPosition,
        annual_revenue: annualRevenue
      },
      company_name: companyName,
      company_size: companySize,
      company_sector: companySector,
      company_website: companyWebsite,
      current_position: currentPosition,
      annual_revenue: annualRevenue
    };
    
    console.log("Dados preparados para salvar:", updateData);
    
    // Atualizar na tabela onboarding_progress
    const { data: result, error } = await supabase
      .from('onboarding_progress')
      .update(updateData)
      .eq('id', progressId)
      .select();
      
    if (error) {
      console.error("Erro ao salvar dados profissionais em onboarding_progress:", error);
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error("Erro ao salvar dados profissionais:", error);
    // Não interromper o fluxo, apenas logar o erro
    return null;
  }
};

/**
 * Busca os dados profissionais do progresso
 */
export const fetchProfessionalData = async (progressId: string) => {
  try {
    // Buscar os dados profissionais diretamente da tabela onboarding_progress
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('professional_info, company_name, company_size, company_sector, company_website, current_position, annual_revenue')
      .eq('id', progressId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        console.log("Nenhum dado profissional encontrado para o progresso:", progressId);
        return null;
      }
      console.error("Erro ao buscar dados profissionais:", error);
      return null;
    }
    
    return {
      ...data,
      // Garantir que o campo professional_info seja sempre um objeto
      professional_info: data.professional_info || {}
    };
  } catch (error) {
    console.error("Erro ao buscar dados profissionais:", error);
    return null;
  }
};

/**
 * Formata os dados profissionais para incluir no objeto de progresso
 */
export const formatProfessionalData = (data: any) => {
  if (!data) return {};
  
  // Se tivermos professional_info como um objeto, usamos ele
  // caso contrário, construímos a partir dos campos individuais
  const professionalInfo = data.professional_info || {};
  
  // Criar objeto consolidado com dados de ambas as fontes
  return {
    company_name: data.company_name || professionalInfo.company_name || "",
    company_size: data.company_size || professionalInfo.company_size || "",
    company_sector: data.company_sector || professionalInfo.company_sector || "",
    company_website: data.company_website || professionalInfo.company_website || "",
    current_position: data.current_position || professionalInfo.current_position || "",
    annual_revenue: data.annual_revenue || professionalInfo.annual_revenue || "",
    professional_info: {
      company_name: data.company_name || professionalInfo.company_name || "",
      company_size: data.company_size || professionalInfo.company_size || "",
      company_sector: data.company_sector || professionalInfo.company_sector || "",
      company_website: data.company_website || professionalInfo.company_website || "",
      current_position: data.current_position || professionalInfo.current_position || "",
      annual_revenue: data.annual_revenue || professionalInfo.annual_revenue || "",
    }
  };
};
