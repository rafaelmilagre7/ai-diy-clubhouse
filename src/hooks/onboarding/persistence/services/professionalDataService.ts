
import { supabase } from "@/lib/supabase";
import { normalizeField } from "../utils/dataNormalization";
import { ProfessionalDataInput } from "@/types/onboarding";

/**
 * Salva os dados profissionais na tabela específica
 */
export const saveProfessionalData = async (
  progressId: string,
  userId: string,
  data: Partial<ProfessionalDataInput>
) => {
  try {
    console.log("Salvando dados profissionais:", { progressId, userId, data });
    
    // Em vez de tentar salvar em uma tabela separada, vamos atualizar diretamente
    // na tabela onboarding_progress usando o campo professional_info
    const { data: result, error } = await supabase
      .from('onboarding_progress')
      .update({
        professional_info: data,
        company_name: data.company_name || null,
        company_size: data.company_size || null,
        company_sector: data.company_sector || null,
        company_website: data.company_website || null,
        current_position: data.current_position || null,
        annual_revenue: data.annual_revenue || null,
      })
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
    // Agora obteremos os dados profissionais diretamente da tabela onboarding_progress
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
