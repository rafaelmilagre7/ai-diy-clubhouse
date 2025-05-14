
import { supabase } from "@/lib/supabase";

/**
 * Busca dados profissionais específicos para um progresso
 */
export const fetchProfessionalData = async (progressId: string) => {
  if (!progressId) {
    console.error("[ERRO] ID de progresso não fornecido para busca de dados profissionais");
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('onboarding_professional_info')
      .select('*')
      .eq('progress_id', progressId)
      .maybeSingle();
    
    if (error) {
      console.error("[ERRO] Erro ao buscar dados profissionais:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("[ERRO] Exceção ao buscar dados profissionais:", error);
    return null;
  }
};

/**
 * Formata dados profissionais para o formato esperado
 */
export const formatProfessionalData = (data: any) => {
  if (!data) return {};
  
  // Extrair os campos específicos para professional_info
  const professional_info = {
    company_name: data.company_name || "",
    company_size: data.company_size || "",
    company_sector: data.company_sector || "",
    company_website: data.company_website || "",
    current_position: data.current_position || "",
    annual_revenue: data.annual_revenue || ""
  };
  
  // Retornar formato consistente com os dados top-level
  return {
    professional_info,
    company_name: data.company_name || "",
    company_size: data.company_size || "",
    company_sector: data.company_sector || "",
    company_website: data.company_website || "",
    current_position: data.current_position || "",
    annual_revenue: data.annual_revenue || ""
  };
};
