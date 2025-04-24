
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
    
    // Estrutura de dados para inserção
    const professionalData = {
      progress_id: progressId,
      user_id: userId,
      company_name: data.company_name || null,
      company_size: data.company_size || null,
      company_sector: data.company_sector || null,
      company_website: data.company_website || null,
      current_position: data.current_position || null,
      annual_revenue: data.annual_revenue || null,
    };
    
    const { data: result, error } = await supabase
      .from('professional_data')
      .upsert(professionalData)
      .select();
      
    if (error) {
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error("Erro ao salvar dados profissionais:", error);
    throw error;
  }
};

/**
 * Busca os dados profissionais da tabela específica
 */
export const fetchProfessionalData = async (progressId: string) => {
  try {
    const { data, error } = await supabase
      .from('professional_data')
      .select('*')
      .eq('progress_id', progressId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        console.log("Nenhum dado profissional encontrado para o progresso:", progressId);
        return null;
      }
      throw error;
    }
    
    return data;
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
  
  return {
    company_name: data.company_name || "",
    company_size: data.company_size || "",
    company_sector: data.company_sector || "",
    company_website: data.company_website || "",
    current_position: data.current_position || "",
    annual_revenue: data.annual_revenue || "",
    professional_info: {
      company_name: data.company_name || "",
      company_size: data.company_size || "",
      company_sector: data.company_sector || "",
      company_website: data.company_website || "",
      current_position: data.current_position || "",
      annual_revenue: data.annual_revenue || "",
    }
  };
};
